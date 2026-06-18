

module.exports = {

    /**
     * Technically an operator that falls under the 'constructor expression' category.
     * 
     * ... CONV type( [ let_exp] dobj ) ...
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONSTRUCTOR_EXPRESSION_CONV.html
     */
    conv_expression: $ => seq(
        gen.kw("conv"),
        field("type", $._constructor_result),
        "(",
        optional($.let_expression),
        field("subject", $.general_expression),
        ")"
    ),
}