module.exports = {

    /**
     * ... VALUE type( ... ) ...
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONSTRUCTOR_EXPRESSION_VALUE.html
     */
    value_expression: $ => seq(
        gen.kw("value"),
        field("type", $._constructor_result),
        gen.parenthesized(seq(
            optional($.let_expression),
            optional($.__value_expr_inner),
            optional($._table_expr_default)
        )),
    ),

    __value_expr_inner: $ => choice(
        $.argument_list,
        $.table_constructor,
        $.table_comprehension
    )
}