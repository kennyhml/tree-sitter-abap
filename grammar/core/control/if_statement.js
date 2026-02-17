const gen = require("../generators.js")

module.exports = {

    /**
     * IF log_exp1. 
     * [statement_block1] 
     * ...
     * ENDIF.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPIF.html
     */
    if_statement: $ => seq(
        gen.kw("if"),
        field("condition", $._logical_expression), ".",
        field("consequence", optional($.statement_block)),

        repeat(field("alternative", $.elseif_clause)),
        optional(field("alternative", $.else_clause)),

        gen.kw("endif"), "."
    ),

    /**
     * ...
     * ELSEIF log_exp2. 
     * [statement_block1] 
     * ...
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPIF.html
     */
    elseif_clause: $ => seq(
        gen.kw("elseif"),
        field("condition", $._logical_expression),
        ".",
        field("consequence", optional($.statement_block)),
    ),

    /**
     * ...
     * ELSE. 
     * [statement_block1] 
     * ...
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPIF.html
     */
    else_clause: $ => seq(
        gen.kw("else"),
        ".",
        field("consequence", optional($.statement_block)),
    ),
}