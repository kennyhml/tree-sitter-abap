/// <reference types="tree-sitter-cli/dsl" />
const path = require('path');
const fs = require('fs');

// its a hassle having to pass the grammar proxy around
// to each call to a generator function. However, its
// needed to insert rules into the grammar or alias certain
// rules to real nodes in the tree. Since global variables
// can only be exported as read-only, we need a wrapper.
const state = {
    grammarProxy: null
}

function kw(keyword) {

    // Optionals are technically choices
    let opt = false;
    if (keyword.type === 'CHOICE') {
        keyword = keyword.members[0].value;
        opt = true;
    }

    const nodeName = `_kw_${keyword.toLowerCase().replace("-", "_")}`;
    const rule = state.grammarProxy[nodeName];
    return opt ? optional(rule) : rule;
}

/**
 * Same as the {@link kw} rule, except that the result is represented as
 * a node in the ruleset.
 * 
 * This is useful for certain additions, such as 'OBLIGATORY' which 
 * consts entirely of keyword in itself.
 * 
 * <<< ... OBLIGATORY ...
 * >>> ... (obligatory) ...
 */
function visible_kw(keyword) {
    if (state.grammarProxy === null) {
        throw Error("Grammar proxy not passed.");
    }
    const repr = keyword.replace("-", "_").toLowerCase();

    const regexExpression = caseInsensitive(keyword);
    return alias(regexExpression, state.grammarProxy[repr]);
}

function kws(...keywords) {
    return keywords.map(kw)
}

/**
 * Same as the {@link kws} rule, except that the result is represented as
 * a node in the ruleset.
 * 
 * This is useful for certain additions, such as 'TRANSPORTING NO FIELDS' 
 * which consts entirely of keywords.
 * 
 * <<< ... TRANSPORTING NO FIELDS ...
 * >>> ... (transporting_no_fields) ...
 */
function visible_kws(...keywords) {
    const rule = seq(...keywords.map(kw));

    const nodeName = keywords.map(v => v.replace("-", "_")).join("_").toLowerCase();
    rule = alias(rule, state.grammarProxy[nodeName]);
    return rule;
}

function caseInsensitive(...terms) {
    terms = terms.map((t) => new RustRegex(t
        .split('')
        .map(l => l !== l.toUpperCase() ? `[${l}${l.toUpperCase()}]` : l)
        .join('')
    ));

    return terms.length == 1 ? terms[0] : terms;
}

/**
 * Generates a declaration node for the given keyword and specification.
 */
function chainable(keyword, spec) {
    return seq(
        kw(keyword),
        // If the declaration is followed by a `:` it means multiple
        // specifications are likely to follow.
        choice(
            seq(":", commaSep1(spec)),
            spec
        ),
        "."
    );
}

/**
 * Lightweight variant of {@link chainable} useful when the statement is not
 * a declaration initiated by a single keyword or no statement terminator is
 * strictly required.
 */
function chainable_immediate(spec) {
    return choice(
        seq(":", spec, repeat(seq(",", spec))),
        spec
    )
}

/**
 * Serves the same purpose as {@link generate_decl}, except that in this case
 * the specification itself is generated and handles the different ways to
 * declare data/type object and structures.
...
 */
function declaration_and_spec(keyword, identifier, prefix) {
    prefix ??= "";
    rules = {}
    const decl = `${prefix}${keyword.replace("-", "_")}_declaration`;
    const spec = `${prefix}${keyword.replace("-", "_")}_spec`;

    rules[spec] = $ => choice(
        seq(
            field("name", identifier($)),
            optional(field("typing", $._typing)),
        ),
        $.begin_of_struct,
        $.end_of_struct,
    );

    rules[decl] = $ => chainable(keyword, $[spec]);
    return rules;
}


function commaSep1(rule) {
    return seq(rule, repeat(seq(",", rule)))
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
    return seq("(", rule, ")")
}

/**
 * Enforces tight parentheses around a rule that starts immediately.
 * 
 * For example: ... struct-(comp).
 *                         ^^^^^^
 */
function immediateTightParens(rule) {
    return seq(token.immediate("("), rule, token.immediate(")"))
}

/**
 * Enforces tight parentheses around a rule but allows any number
 * of extras up to the first parenthesis.
 * 
 * For example: ... where (expr).
 *                       ^^^^^^^ 
 */
function tightParens(rule) {
    return seq("(", rule, token.immediate(")"))
}

function kwRules() {
    const root = process.cwd();

    const files = fs.readdirSync(root, { recursive: true, withFileTypes: true })
        .filter((f) =>
            f.isFile() &&
            f.name.endsWith(".js") &&
            !f.parentPath.includes("node_modules")
        );

    const keywords = new Set();
    const callRegex = /gen\.\w+\(([^)]+)\)/g;

    for (const file of files) {
        const fullPath = path.join(file.parentPath || file.path, file.name);
        const content = fs.readFileSync(fullPath, 'utf8');

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

    const rules = {};
    for (const keyword of keywords) {
        const regexExpression = caseInsensitive(keyword);
        const repr = `_kw_${keyword.toLowerCase().replace("-", "_")}`;
        const rule = alias(regexExpression, keyword.toLowerCase());

        rules[repr] = $ => rule;
    }
    return rules;
}

module.exports = {
    state,
    caseInsensitive,
    kwRules,
    kw,
    kws,
    visible_kw,
    visible_kws,
    chainable_immediate,
    chainable,
    declaration_and_spec,
    commaSep1,
    kw_tagged,
    tightParens,
    immediateTightParens,
    parenthesized
};