const gen = require("../core/generators.js")

module.exports = {

    /**
     * INCLUDE incl [IF FOUND].
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPINCLUDE_PROG.html
     */
    include_statement: $ => seq(
        gen.kw("include"),
        field("name", $.identifier),
        optional($.if_found_spec),
        "."
    ),

}