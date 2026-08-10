module.exports = {
  /**
   * CLEAR dobj [ {WITH val [IN {CHARACTER|BYTE} MODE] }
   *
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLEAR.html
   */
  free_statement: $ => seq($.__free_statement_prefix, "."),

  __free_statement_prefix: $ =>
    gen.chainable("free", $.free_spec),

  free_spec: $ => field("subject", $._modifiable_target),
};
