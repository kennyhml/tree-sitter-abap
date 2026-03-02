


module.exports = {

    /**
     * ... NEW type( ... ) ...
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONSTRUCTOR_EXPRESSION_NEW.html
     */
    new_expression: $ => seq(
        gen.kw("new"),
        field("type", $._constructor_result),
        token.immediate("("),
        optional($.let_expression),
        optional(
            choice(
                /** See {@link argument_list} for the ambiguity */
                $.argument_list,
                $.table_constructor,
                $.table_comprehension
            ),
        ),
        ")",
    )

}