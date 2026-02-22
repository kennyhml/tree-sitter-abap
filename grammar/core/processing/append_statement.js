const gen = require("../generators.js")

module.exports = {

    /**
     * APPEND line_spec TO itab [SORTED BY comp] [result].
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abapappend.html
     */
    append_statement: $ => seq(
        gen.kw("append"),
        field("lines", $._line_spec),
        gen.kw("to"),
        field("subject", $.general_expression),
        optional(alias($.__append_sorted_by, $.sorted_by)),
        optional(field("result", $.__append_result)),
        "."
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