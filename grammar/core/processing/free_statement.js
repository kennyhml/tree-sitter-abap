const { kw } = require("../../helpers/keywords.js")
const { chainable } = require("../../helpers/decl_gen.js")

module.exports = {

    /**
     * CLEAR dobj [ {WITH val [IN {CHARACTER|BYTE} MODE] } 
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLEAR.html
     */
    free_statement: $ => chainable("free", $.named_data_object),
}