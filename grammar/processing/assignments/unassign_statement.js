module.exports = {
  /**
   * UNASSIGN <fs>
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPUNASSIGN.html
   */
  ...gen.periodTerminated("unassign_statement", $ =>
    gen.chainable("unassign", $.field_symbol),
  ),
};
