module.exports = {

    /**
     * ... COND type( [let_exp] 
     *                WHEN log_exp1 THEN [let_exp] result1
     *              [ WHEN log_exp2 THEN [let_exp] result2 ] 
     *              ... 
     *              [ ELSE [let_exp] resultn] ) ...
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONDITIONAL_EXPRESSION_COND.html
     */
    cond_expression: $ => seq(
        gen.kw("cond"),
        field("type", $._constructor_result),
        gen.parenthesized(seq(
            optional($.let_expression),
            repeat1($.case),
            optional($.else_case),
        )),
    ),

    /** ... SWITCH type( [let_exp] 
     *                  operand
     *                  WHEN const1 THEN [let_exp] result1
     *                [ WHEN const2 THEN [let_exp] result2 ] 
     *                ... 
     *                [ELSE[let_exp] resultn] ) ...
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONDITIONAL_EXPRESSION_SWITCH.html
     */
    switch_expression: $ => seq(
        gen.kw("switch"),
        field("type", $._constructor_result),
        gen.parenthesized(seq(
            optional($.let_expression),
            field("subject", $.general_expression),
            repeat1($.case),
            optional($.else_case),
        )),
    ),

    resumable: _ => gen.kw("resumable"),

    shortdump: _ => gen.kw("shortdump"),

    case: $ => seq(
        gen.kw("when"),
        field("condition", choice($._logical_expression, $.data_object)),
        gen.kw("then"),
        optional($.let_expression),
        field("result", $.__conditional_result)
    ),

    else_case: $ => seq(
        gen.kw("else"),
        optional($.let_expression),
        field("result", $.__conditional_result)
    ),

    /**
     * ...   operand 
     *   / { THROW [RESUMABLE|SHORTDUMP] cx_class( [message] 
     *                                             [p1 = a1 p2 = a2 ...] ) } ...
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONDITIONAL_EXPRESSION_RESULT.html
     */
    throw_exception: $ => seq(
        gen.kw("throw"),
        optional($.resumable),
        optional($.shortdump),
        field("name", $.identifier),
        gen.parenthesized(optional($.inline_message)),
    ),

    /**
     * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENCONDITIONAL_EXPRESSION_RESULT.html
     */
    __conditional_result: $ => choice(
        $.general_expression,
        $.throw_exception
    ),
}