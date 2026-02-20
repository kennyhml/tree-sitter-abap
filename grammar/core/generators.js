/// <reference types="tree-sitter-cli/dsl" />

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
    const regexExpression = caseInsensitive(keyword);
    const rule = alias(regexExpression, keyword.toLowerCase());
    addKeywordChoice(rule);
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
    addKeywordChoice(alias(regexExpression, repr));
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
    const comp = `_${prefix}${keyword.replace("-", "_")}_comp_spec`;

    /**
     * Regardless of whether a struct is declared using CONSTANTS, TYPES, etc.
     * the components (fields) that make up the structure should always be
     * identifier nodes, not const and much less type nodes.
     * * Because the keyword at the start of each line still needs to be taken into
     * consideration, such a helper rule is necessary.
     */
    rules[comp] = $ => choice(
        seq(
            field("name", $.identifier),
            optional(field("type", $._typing))
        ),

        structureSpec($, undefined, $.identifier, $[comp]),
        structureSpec($, keyword, $.identifier, $[comp]),
    );

    rules[spec] = $ => choice(
        seq(
            field("name", identifier($)),
            optional(field("typing", $._typing)),
        ),

        /**
         * This technically isnt completely legal since it allows sub structure specs preceded by a DATA
         * keyword inside a `data:` block, but it is such a niche scenario worth keeping the grammar simpler over.
         * * It is however quite important to generate two absolute paths here, because we at least dont want to allow
         * the old-style struct declaration to be completed mixed into new-style declarations, i.e when the
         * declaration block starts with DATA [...]., it shouldnt be allowed to have a component inside the
         * block that does NOT start with DATA.
         * */
        structureSpec($, undefined, identifier($), $[comp]),
        structureSpec($, keyword, identifier($), $[comp]),
    );

    rules[decl] = $ => chainable(keyword, $[spec]);
    return rules;
}

/**
 * Generates a structure specification rule.
...
 */
function structureSpec($, keyword, identifierNode, componentRule) {
    // If a keyword is present, the separator MUST be a `.`
    let separator = keyword ? '.' : ',';

    let compRule = seq(alias(componentRule, $.component_spec), separator);
    let endRule = seq(...kws("end", "of"));
    if (separator == '.') {
        compRule.members.unshift(kw(keyword), optional(":"))
        endRule.members.unshift(kw(keyword), optional(":"));
    }

    return seq(
        ...kws("begin", "of"), field("nameOpen", identifierNode),
        optional(kw("read-only")),
        separator,
        // Technically at least one field is required, but this is another one
        // of those situations where it makes more sense to just let it parse
        // and pre process the problem.
        repeat(
            choice(
                compRule,
                seq($.struct_include, separator)
            )
        ),
        endRule, field("nameClose", identifierNode)
    );
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

let orphanRules = [];
function addKeywordChoice(rule) {

    // rule = alias(rule, state.grammarProxy['orphan_keyword']);
    // orphanRules.push(rule);
    // state.grammarProxy['_orphan_keyword'] = $ => prec(10, choice(...orphanRules));
}

module.exports = {
    state,
    caseInsensitive,
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
    immediateTightParens
};