import { kw, kws } from '../helpers/keywords.js'
/// <reference types="tree-sitter-cli/dsl" />

/**
 * Generates a declaration node for the given keyword and specification.
 * 
 * For example, the specification of a single dynpro parameter is known:
 * ```
 * parameters foo for baz-bar no intervals.
 * //         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^ 
 * //             a single specification
 * ```
 * But its also possible to put this into a larger chain of specifications:
 * ```
 * parameters: foo for baz-bar no intervals,
 *             bar for foo-baz matchcode object z_searchhelp,
 *             aa  for bb obligatory.
 * ```
 * 
 * Given the individual specifications, this rule generates the 
 * corresponding declaration statement.
 * 
 * @param {string} keyword The keyword to precede the declaration
 * @param {Rule} spec The rule to match the individual specifications
 * 
 * @returns {Rule} A rule to handle the declarations.
*/
export function chainable(keyword, spec) {
    return seq(
        kw(keyword),
        // If the declaration is followed by a `:` it means multiple
        // specifications are likely to follow.
        choice(
            seq(":", spec, repeat(seq(",", spec))),
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
export function chainable_immediate(spec) {
    return choice(
        seq(":", spec, repeat(seq(",", spec))),
        spec
    )
}

/**
 * Serves the same purpose as {@link generate_decl}, except that in this case
 * the specification itself is generated and handles the different ways to
 * declare data/type object and structures.
 * 
 * @param {string} keyword The keyword to precede the declaration
 * @param {Rule} identifier The resulting identifier inside the individual specs.
 * 
 * @returns {Rule} A set of rules to handle the declarations to insert into the grammar.
 */
export function declaration_and_spec(keyword, identifier, prefix) {
    let rules = {}
    prefix ??= "";

    const decl = `${prefix}${keyword.replace("-", "_")}_declaration`;
    const spec = `${prefix}${keyword.replace("-", "_")}_spec`;
    const comp = `_${prefix}${keyword.replace("-", "_")}_comp_spec`;

    /**
     * Regardless of whether a struct is declared using CONSTANTS, TYPES, etc.
     * the components (fields) that make up the structure should always be
     * identifier nodes, not const and much less type nodes.
     * 
     * Because the keyword at the start of each line still needs to be taken into
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
         * 
         * It is however quite important to generate two absolute paths here, because we at least dont want to allow
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
 * 
 * There are essentially 4 ways to define structures:
 * 
 * 1. TYPES: BEGIN OF foo, [...]
 * 2. DATA BEGIN OF foo. [...]
 * 3. DATA: BEGIN OF foo, [...]
 * 4. TYPES BEGIN OF foo. [...]
 * 
 * @param {string | undefined} keyword The keyword of the struct, either DATA, TYPES or undefined.
 * @param {Rule} identifierNode The identifier type for the structure
 * @param {Rule} componentRule The identifier type for components of the structure
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