module.exports = {

    /**
     * ABAP considers both COND and SWITCH to just be a conditional expression.
     * 
     * COND and SWITCH respectively are the operators in this case, the syntax
     * variants only differ ever so slightly.
     * 
     * ... COND type( [let_exp] 
     *                WHEN log_exp1 THEN [let_exp] result1
     *              [ WHEN log_exp2 THEN [let_exp] result2 ] 
     *              ... 
     *              [ ELSE [let_exp] resultn] ) ...
     * 
     * OR 
     * 
     * ... SWITCH type( [let_exp] 
     *                  operand
     *                  WHEN const1 THEN [let_exp] result1
     *                [ WHEN const2 THEN [let_exp] result2 ] 
     *                ... 
     *                [ ELSE [let_exp] resultn] ) ...
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abenconditional_expressions.html
     */
    conditional_expression: $ => seq(
        field("operator", choice($.switch, $.cond)),
        field("type", $._constructor_result),
        gen.parenthesized(seq(
            optional($.let_expression),
            // Only in the case of a switch operator
            optional(field("subject", $.general_expression)),
            repeat1($.case),
            optional($.else_case),
        )),
    ),

    switch: _ => gen.kw("switch"),

    cond: _ => gen.kw("cond"),

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
        field("name", $._type_identifier),
        gen.parenthesized(optional($.inline_message_spec)),
    ),

    /**
     * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENCONDITIONAL_EXPRESSION_RESULT.html
     */
    __conditional_result: $ => choice(
        $.general_expression,
        $.throw_exception
    ),
}