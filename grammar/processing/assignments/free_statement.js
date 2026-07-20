module.exports = {
  /**
   * CLEAR dobj [ {WITH val [IN {CHARACTER|BYTE} MODE] }
   *
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLEAR.html
   */
  ...gen.periodTerminated("free_statement", $ =>
    gen.chainable("free", $.named_data_object),
  ),
};
