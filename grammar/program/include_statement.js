import { kw, kws } from '../helpers/keywords.js'

export default {

    /**
     * INCLUDE incl [IF FOUND].
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPINCLUDE_PROG.html
     */
    include_statement: $ => seq(
        kw("include"),
        field("name", $.identifier),
        optional($.if_found_spec),
        "."
    ),

    if_found_spec: _ => seq(...kws("if", "found"))
}