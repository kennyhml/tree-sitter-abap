const { kw, kws } = require("../../helpers/keywords.js");

module.exports = {

    /**
     * TODO: Add tests
     * 
     * 
     * CASE operand. 
     *   [WHEN operand1 [OR operand2 [OR operand3 [...]]]. 
     *     [statement_block1]] 
     *   ... 
     *   [WHEN OTHERS. 
     *     [statement_blockn]] 
     * ENDCASE.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCASE.html
     */
    case_statement: $ => seq(
        kw("case"),
        field("subject", $.general_expression),
        ".",
        repeat(field("alternative", $.case_clause)),
        optional(field("others", $.others_case_clause)),
        kw("endcase"), "."
    ),

    case_clause: $ => seq(
        kw("when"),
        field("condition", $.case_operand_list),
        ".",
        field("consequence", optional($.statement_block)),
    ),

    others_case_clause: $ => seq(
        ...kws("when", "others"), ".",
        field("consequence", optional($.statement_block)),
    ),

    case_operand_list: $ => seq(
        $.__case_operand,
        repeat(seq(kw("or"), $.__case_operand))
    ),

    /**
     * These are 'extended functional positions' and considered obsolete
     * 
     * See https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENEXTENDED_FUNCTIONAL_POSITIONS.html
     */
    __case_operand: $ => choice(
        $.data_object,
        $.builtin_function_call,
        $.constructor_expression,
        $.method_call
    ),

}