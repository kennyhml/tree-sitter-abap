module.exports = {

    /**
     * ... EXACT type( [let_exp] dobj ) ...
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONSTRUCTOR_EXPRESSION_EXACT.html
     */
    exact_expression: $ => seq(
        gen.kw("exact"),
        field("type", $._constructor_result),
        "(",
        optional($.let_expression),
        field("subject", $.general_expression),
        ")"
    ),

}