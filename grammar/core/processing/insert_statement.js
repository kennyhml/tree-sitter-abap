const gen = require("../generators.js")

module.exports = {

    /**
     * INSERT line_spec INTO itab_position [result].
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPINSERT_ITAB.html
     */
    insert_statement: $ => seq(
        gen.kw("insert"),
        field("lines", $._line_spec),
        gen.kw("into"),
        field("position", $.__insert_position),
        optional(field("result", $.__insert_result)),
        "."
    ),

    /**
     * ... {TABLE itab} 
     *   | {itab INDEX idx} 
     *   | {itab} ...
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPINSERT_ITAB_POSITION.html
     */
    __insert_position: $ => choice(
        $.into_table,
        $.at_index,
    ),

    into_table: $ => seq(
        gen.kw("table"),
        field("table", $.general_expression)
    ),

    at_index: $ => seq(
        field("table", $.general_expression),
        // can be ommitted inside a loop at statement
        optional(seq(
            gen.kw("index"),
            field("index", $.general_expression)
        ))
    ),

    /**
     * ... { ASSIGNING <fs> [CASTING] [ELSE UNASSIGN]} 
     *   | { REFERENCE INTO dref }.
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPINSERT_ITAB_POSITION.html
     */
    __insert_result: $ => choice(
        $.assigning,
        $.reference_into
    )
}