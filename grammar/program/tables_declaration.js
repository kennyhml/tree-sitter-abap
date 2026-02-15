import { chainable } from '../helpers/decl_gen.js'

export default {

    /**
     * TABLES: table_wa, table_wa1.
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPTABLES.html
     */
    tables_declaration: $ => chainable("tables", $.identifier),
}