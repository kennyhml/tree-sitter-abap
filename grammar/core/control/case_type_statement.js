const { kw, kws } = require("../../helpers/keywords.js");

module.exports = {

    /**
     * TODO: Add tests
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCASE_TYPE.html
     */
    case_type_of_statement: $ => seq(
        ...kws("case", "type", "of"),
        field("subject", $.general_expression),
        ".",
        repeat(field("alternative", $.case_type_clause)),
        optional(field("others", $.case_others_type_clause)),
        kw("endcase"), "."
    ),

    /**
     * [WHEN TYPE class|intf [INTO target2]. 
     *   [statement_block2]] 
     */
    case_type_clause: $ => seq(
        ...kws("when", "type"),
        field("type", $._type_identifier),
        optional($.cast_into_spec),
        ".",
        field("consequence", optional($.statement_block)),
    ),

    /**
     * [WHEN OTHERS. 
     *   [statement_block2]] 
     */
    case_others_type_clause: $ => seq(
        ...kws("when", "others"), ".",
        field("consequence", optional($.statement_block)),
    ),

    // [INTO target1]
    cast_into_spec: $ => seq(
        kw("into"),
        field("target",
            choice(
                $.named_data_object,
                $.declaration_expression
            )
        )
    ),

}