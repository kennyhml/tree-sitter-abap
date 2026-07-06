module.exports = {
  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSPLIT.html
  split_statement: $ =>
    seq(
      gen.kw("split"),
      field("subject", $.character_like_expression),
      $.split_at,
      $.split_result,
      optional($._processing_mode_spec),
      ".",
    ),

  split_at: $ => seq(gen.kw("at"), field("separator", $.data_object)),

  /**
   * `INTO { {result1 result2 [...]} | {TABLE result_tab} }`
   */
  split_result: $ =>
    prec.right(
      seq(
        gen.kw("into"),
        choice(repeat1($.receiving_expression), $.split_table_result),
      ),
    ),

  split_table_result: $ =>
    seq(gen.kw("table"), field("target", $.receiving_expression)),
};
