module.exports = {
  /**
   * CLEAR dobj [ {WITH val [IN {CHARACTER|BYTE} MODE] }
   *
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLEAR.html
   */
  clear_statement: $ => seq($.__clear_statement_prefix, "."),

  __clear_statement_prefix: $ =>
    gen.chainable("clear", $.clear_spec),

  clear_spec: $ =>
    seq(
      field("subject", $.writable_expression),
      optional(field("with", $.clear_value_spec)),
    ),

  clear_value_spec: $ =>
    seq(
      gen.kw("with"),
      field("value", $.functional_expression),
      optional($._processing_mode_spec),
    ),
};
