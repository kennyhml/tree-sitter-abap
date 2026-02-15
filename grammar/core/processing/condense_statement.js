const { kw, kws } = require("../../helpers/keywords.js")


module.exports = {

    /**
     * CONDENSE text [NO-GAPS].
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCONDENSE.html
     */
    condense_statement: $ => seq(
        kw("condense"),
        field("text", $.data_object),
        optional($.no_gaps_spec),
        "."
    ),

    no_gaps_spec: _ => kw("no-gaps"),
}