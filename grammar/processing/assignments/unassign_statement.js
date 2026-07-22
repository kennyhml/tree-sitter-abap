module.exports = {
  /**
   * UNASSIGN <fs>
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPUNASSIGN.html
   */
  unassign_statement: $ => seq($.__unassign_statement_prefix, "."),

  __unassign_statement_prefix: $ =>
    gen.chainable("unassign", $.field_symbol),
};
