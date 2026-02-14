import { kw } from "../../helpers/keywords.js"

export default {

    /**
     * TODO: Add tests
     * 
     * WHILE log_exp
     * [statement_block] 
     * ENDWHILE.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPWHILE.html
     */
    while_statement: $ => seq(
        kw("while"),
        field("condition", $._logical_expression),
        ".",
        optional(field("body", $.statement_block)),
        kw("endwhile"),
        "."
    ),
}