const gen = require("../generators.js")

module.exports = {

    /**
     * CLEAR dobj [ {WITH val [IN {CHARACTER|BYTE} MODE] } 
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLEAR.html
     */
    free_statement: $ => gen.chainable("free", $.named_data_object),
}