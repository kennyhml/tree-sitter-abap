const gen = require("../generators.js")

module.exports = {

    /**
     * Technically an obsolete language element - still commonly used.
     * 
     * ADD dobj1 TO dobj2.
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPADD.html
     */
    append_statement: $ => seq(
        gen.kw("append"),
        field("lines", $.__append_lines),
        gen.kw("to"),
        field("subject", $.general_expression),
        optional(alias($.__append_sorted_by, $.sorted_by)),
        optional(field("result", $.__append_result)),
        "."
    ),

    /**
     * ... wa 
     *     | {INITIAL LINE} 
     *     | {LINES OF jtab [FROM idx1] [TO idx2] [STEP n] [USING KEY keyname]} ...
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPAPPEND_LINESPEC.html
     */
    __append_lines: $ => choice(
        $.general_expression,
        $.initial_line,
        $.lines_of,
    ),

    /**
     * [SORTED BY comp]
     */
    __append_sorted_by: $ => seq(
        ...gen.kws("sorted", "by"),
        field("comp", $.itab_comp)
    ),

    /**
     * ... { ASSIGNING <fs> [CASTING]} 
     *   | { REFERENCE INTO dref }.
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPAPPEND_RESULT.html
     */
    __append_result: $ => choice(
        $.assigning,
        $.reference_into
    )
}