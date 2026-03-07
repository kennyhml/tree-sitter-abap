module.exports = {

    /**
     * ... REF type( dobj | table_exp ) ...
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONSTRUCTOR_EXPRESSION_REF.html
     */
    ref_expression: $ => seq(
        gen.kw("ref"),
        field("type", $._constructor_result),
        "(",
        optional($.let_expression),
        field("subject", choice(
            $.data_object,
            $.table_expression
        )),
        optional($._table_expr_default),
        ")"
    ),

}