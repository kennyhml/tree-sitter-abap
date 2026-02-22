const gen = require("../generators.js")

module.exports = {

    /**
     * SORT itab [STABLE]
     *      { { [ASCENDING|DESCENDING]
     *          [AS TEXT]
     *          [BY {comp1 [ASCENDING|DESCENDING] [AS TEXT]}
     *              {comp2 [ASCENDING|DESCENDING] [AS TEXT]}
     *              ... ] }
     *      / { [BY (otab)] }
     *      / { [BY expr] } }.
     * 
     * Ambiguity exists between a dynamic component specification and a the specification
     * of a sort table.
     *
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abapsort_itab.html
     */
    sort_statement: $ => seq(
        gen.kw("sort"),
        field("subject", $.general_expression),
        optional($.__sort_additions),
        "."
    ),

    __sort_additions: $ => seq(
        optional(gen.kw("stable")),
        choice(
            $.by_order_table,
            $.sort_component_list,
            seq(
                $.sort_order,
                optional($.sort_component_list)
            ),
            $.as_text
        ),
    ),

    // { [BY (otab)] } 
    by_order_table: $ => seq(
        gen.kw("by"),
        field("order_table", choice(
            $.dyn_spec,
            $.constructor_expression,
            $.method_call
        ))
    ),
}