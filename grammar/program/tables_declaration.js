const gen = require("../core/generators.js")

module.exports = {

    /**
     * TABLES: table_wa, table_wa1.
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPTABLES.html
     */
    tables_declaration: $ => gen.chainable("tables", $.identifier),
}