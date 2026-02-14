import { kw } from "../../helpers/keywords.js"


export default {
    /**
     * TODO: Add tests
     * 
     * DO [n TIMES]. 
     *   [statement_block] 
     * ENDDO.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDO.html
     */
    do_statement: $ => seq(
        kw("do"),
        optional(field("times", $.times_spec)),
        ".",
        optional(field("body", $.statement_block)),
        kw("enddo"), "."
    ),

    times_spec: $ => seq(
        field("repetitions", $.numeric_expression),
        kw("times")
    )
}