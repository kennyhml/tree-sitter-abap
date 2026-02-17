const gen = require("../generators.js")


module.exports = {
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
        gen.kw("do"),
        optional(field("times", $.times_spec)),
        ".",
        optional(field("body", $.statement_block)),
        gen.kw("enddo"), "."
    ),

    times_spec: $ => seq(
        field("repetitions", $.numeric_expression),
        gen.kw("times")
    )
}