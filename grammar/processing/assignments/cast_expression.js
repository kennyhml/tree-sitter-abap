module.exports = {

    /**
     * ... CAST type( [let_exp] dobj ) ...
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONSTRUCTOR_EXPRESSION_CAST.html
     */
    cast_expression: $ => seq(
        gen.kw("cast"),
        field("type", $._constructor_result),
        "(",
        optional($.let_expression),
        field("subject", $.general_expression),
        ")"
    ),

}