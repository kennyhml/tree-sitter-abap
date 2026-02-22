const gen = require("../generators.js")

module.exports = {

    /**
     * Technically an obsolete language element - still commonly used.
     * 
     * ADD dobj1 TO dobj2.
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPADD.html
     */
    add_statement: $ => seq(
        gen.kw("add"),
        field("value", $.data_object),
        gen.kw("to"),
        field("subject", $.data_object),
        "."
    )
}