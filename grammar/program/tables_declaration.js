const { chainable } = require('../helpers/decl_gen.js')

module.exports = {

    /**
     * TABLES: table_wa, table_wa1.
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPTABLES.html
     */
    tables_declaration: $ => chainable("tables", $.identifier),
}