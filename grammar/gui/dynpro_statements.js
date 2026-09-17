module.exports = {
  /*
   * CALL SCREEN dynnr
   *        [STARTING AT col1 lin1
   *        [ENDING   AT col2 lin2]].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCALL_SCREEN.html
   */
  call_screen_statement: $ => seq($.__call_screen_statement_prefix, "."),

  __call_screen_statement_prefix: $ =>
    seq(
      ...gen.kws("call", "screen"),
      field("dynnr", $._simple_operand),
      optional(field("start", $.starting_at_spec)),
      optional(field("end", $.ending_at_spec)),
    ),
};
