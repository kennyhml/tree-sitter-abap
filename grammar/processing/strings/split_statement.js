module.exports = {
  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSPLIT.html
  split_statement: $ => seq($.__split_statement_prefix, "."),

  __split_statement_prefix: $ =>
    seq(
      gen.kw("split"),
      field("subject", $.character_like_expression),
      $.split_at_spec,
      alias($.__split_result, $.into_spec),
      optional($._processing_mode_spec),
    ),

  split_at_spec: $ => seq(gen.kw("at"), field("separator", $.data_object)),

  /**
   * `INTO { {result1 result2 [...]} | {TABLE result_tab} }`
   */
  __split_result: $ =>
    prec.right(
      seq(
        gen.kw("into"),
        choice(repeat1($.receiving_expression), $.split_table_result),
      ),
    ),

  split_table_result: $ =>
    seq(gen.kw("table"), field("target", $.receiving_expression)),
};
