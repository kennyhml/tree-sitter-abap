const path = require("path");
const fs = require("fs");

// its a hassle having to pass the grammar proxy around
// to each call to a generator function. However, its
// needed to insert rules into the grammar or alias certain
// rules to real nodes in the tree. Since global variables
// can only be exported as read-only, we need a wrapper.
const state = {
  grammarProxy: null,
};

function kw(keyword) {
  // Optionals are technically choices
  let opt = false;
  if (keyword.type === "CHOICE") {
    keyword = keyword.members[0].value;
    opt = true;
  }

  const nodeName = `_kw_${keyword.toLowerCase().replace("-", "_")}`;
  const rule = state.grammarProxy[nodeName];
  return opt ? optional(rule) : rule;
}

function kws(...keywords) {
  return keywords.map(kw);
}

/**
 * Main rule used to turn tokens (mainly keywords) into a case insensitive regexp
 */
function caseInsensitive(...terms) {
  terms = terms.map(t => new RustRegex(`(?i)${t}`));

  return terms.length == 1 ? terms[0] : terms;
}

/**
 * Generates the period-free prefix of a chainable statement for the given
 * keyword and specification.
 */
function chainable(keyword, spec) {
  return seq(
    kw(keyword),
    // If the declaration is followed by a `:` it means multiple
    // specifications are likely to follow.
    choice(seq(":", commaSep1(spec)), spec),
  );
}

function periodTerminated(name, prefixRule) {
  return {
    [name]: $ => seq($["__" + name + "_prefix"], "."),
    ["__" + name + "_prefix"]: prefixRule,
  };
}

/**
 * Lightweight variant of {@link chainable} useful when the statement is not
 * a declaration initiated by a single keyword or no statement terminator is
 * strictly required.
 */
function chainable_immediate(spec) {
  return choice(seq(":", spec, repeat(seq(",", spec))), spec);
}

/**
 * Serves the same purpose as {@link generate_decl}, except that in this case
 * the specification itself is generated and handles the different ways to
 * declare data/type object and structures.
...
 */
function declaration_and_spec(keyword, identifier, prefix) {
  prefix ??= "";
  let rules = {};
  const decl = `${prefix}${keyword.replace("-", "_")}_declaration`;
  const spec = `${prefix}${keyword.replace("-", "_")}_spec`;

  // in theory typing additino is optional and defaults to c1 but that
  // causes ambiguity with enum values and is, realistically, never used.
  rules[spec] = $ =>
    choice(seq(field("name", identifier($)), field("typing", $.typing)));

  return {
    ...rules,
    ...periodTerminated(decl, $ => {
      let opt = [$.begin_of_struct, $.end_of_struct, $[spec]];
      if (keyword === "types") {
        opt.push($.begin_of_enum, $.end_of_enum, $.enum_value_spec);
      }
      return chainable(keyword, choice(...opt));
    }),
  };
}

function commaSep1(rule) {
  return seq(rule, repeat(seq(",", rule)));
}

/**
 * Receives a keyword and a rule and returns a sequence of that
 * keyword, followed by the rule tagged with a field named the
 * same as the keyword.
 *
 * This can be useful when a keyword introduces a node that should
 * be tagged with a field named after the keyword.
 */
function kw_tagged(keyword, rule) {
  return seq(kw(keyword), field(keyword.replace("-", "_"), rule));
}

function parenthesized(rule) {
  return seq("(", rule, ")");
}

/**
 * Enforces tight parentheses around a rule that starts immediately.
 *
 * For example: ... struct-(comp).
 *                         ^^^^^^
 */
function immediateTightParens(rule) {
  return seq(token.immediate("("), rule, token.immediate(")"));
}

/**
 * Enforces tight parentheses around a rule but allows any number
 * of extras up to the first parenthesis.
 *
 * For example: ... where (expr).
 *                       ^^^^^^^
 */
function tightParens(rule) {
  return seq("(", rule, token.immediate(")"));
}

function extractKeywords() {
  const root = process.cwd();

  const files = fs
    .readdirSync(root, { recursive: true, withFileTypes: true })
    .filter(
      f =>
        f.isFile() &&
        f.name.endsWith(".js") &&
        !f.parentPath.includes("node_modules"),
    );

  const keywords = new Set();
  const callRegex = /gen\.\w+\(([^)]+)\)/g;

  for (const file of files) {
    const fullPath = path.join(file.parentPath || file.path, file.name);
    const content = fs.readFileSync(fullPath, "utf8");

    let match;
    while ((match = callRegex.exec(content)) !== null) {
      const insideParens = match[1];
      const stringLiteralRegex = /["']([^"']+)["']/g;
      let strMatch;
      while ((strMatch = stringLiteralRegex.exec(insideParens)) !== null) {
        keywords.add(strMatch[1]);
      }
    }
  }
  return keywords;
}

/**
 * Extracts all keyword usages across the source files in order to pre-create
 * rules for them. This helps to ensure all occurrences of a keyword use the
 * same rule and keep the binary size smaller.
 *
 */
function kwRules() {
  const rules = {};

  const keywords = extractKeywords();
  for (const keyword of keywords) {
    // Since our word rule itself doesnt include a "-", it being
    // part of a token can severely blow up the parser size for
    // some reason. In the case of END-OF-DEFINITION, it caused
    // an increase of 7MB!
    const repr = `_kw_${keyword.toLowerCase().replace("-", "_")}`;

    // Some of these cause conflicts, not worth the hassle
    if (
      keyword.includes("-") &&
      !keyword.includes("bit") &&
      !keyword.includes("type")
    ) {
      const parts = keyword.split("-");

      rules[`_${repr}`] = $ => {
        const seqParts = [];
        parts.forEach((part, i) => {
          if (i > 0) {
            seqParts.push(token.immediate(caseInsensitive(`-${part}`)));
          } else {
            seqParts.push(caseInsensitive(part));
          }
        });
        return seq(...seqParts);
      };
      rules[repr] = $ =>
        field("keyword", alias($[`_${repr}`], keyword.toLowerCase()));
    } else {
      const regex = caseInsensitive(keyword);
      rules[repr] = _ => field("keyword", alias(regex, keyword.toLowerCase()));
    }
  }
  return rules;
}

module.exports = {
  state,
  caseInsensitive,
  kwRules,
  extractKeywords,
  kw,
  kws,
  chainable_immediate,
  chainable,
  periodTerminated,
  declaration_and_spec,
  commaSep1,
  kw_tagged,
  tightParens,
  immediateTightParens,
  parenthesized,
};
