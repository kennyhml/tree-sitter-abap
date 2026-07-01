module.exports = {

    /**
     * ... NEW type( ... ) ...
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONSTRUCTOR_EXPRESSION_NEW.html
     */
    new_expression: $ => seq(
        gen.kw("new"),
        field("type", $._constructor_result),
        gen.parenthesized(seq(
            optional($.let_expression),
            optional($.__new_expr_inner),
        )),
    ),

    __new_expr_inner: $ => choice(
        $.argument_list,
        $.table_constructor,
        $.table_comprehension
    )

}