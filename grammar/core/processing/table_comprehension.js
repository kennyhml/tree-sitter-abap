

module.exports = {

    /**
     * Constructs an internal table in {@link new_expression} and {@link reduce_expression}
     * 
     * This covers the following syntax:
     * [let_exp] 
     * [BASE itab] 
     * [ FOR for_exp1
     *   FOR for_exp2 
     *   ... ] 
     * ( line_spec1 ) 
     * ( line_spec2 ) 
     *   ... )
     * 
     * Before each yield line, default values can be specified.
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENVALUE_CONSTRUCTOR_PARAMS_ITAB.html
     */
    table_comprehension: $ => seq(
        optional($.base_table),

        // Optionally any number of nested for expressions
        repeat($.iteration_expression),

        repeat1(seq(
            repeat($.named_argument),
            $.line_spec
        ))
    ),

    /**
     * Technically unrelated to comprehensions and should probably be moved.
     * 
     * This rule is used for scenarios such as:
     * VALUE #( BASE base1->* col2 = 'BB' ). 
     * 
     * Where an internal table is constructed without specifying individual lines.
     * 
     * Without the base addition, this is amiguous due to the NEW #( ) constructor.
     */
    table_constructor: $ => seq(
        $.base_table,
        $.argument_list
    ),

    /**
     * ... line 
     *   / {LINES OF jtab [FROM idx1] [TO idx2] [STEP n] [USING KEY keyname]} ...
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENNEW_CONSTRUCTOR_PARAMS_LSPC.html
     */
    line_spec: $ => gen.parenthesized(
        optional(
            choice(
                $.lines_of,
                $.argument_list,
            )
        )
    ),

    // ... BASE base ...
    base_table: $ => seq(
        gen.kw("base"),
        field("value", $.named_data_object)
    ),

}