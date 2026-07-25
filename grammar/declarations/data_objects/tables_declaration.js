module.exports = {
  /**
   * TABLES: table_wa, table_wa1.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPTABLES.html
   */
  tables_declaration: $ => seq($.__tables_declaration_prefix, "."),

  __tables_declaration_prefix: $ =>
    gen.chainable("tables", $.tables_spec),

  tables_spec: $ => field("name", $.identifier),
};
