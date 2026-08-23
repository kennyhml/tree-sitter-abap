module.exports = {
  /*
   * ... win_func
   *     OVER( [PARTITION BY sql_exp1, sql_exp2 ...]
   *           [ORDER BY col1 [ASCENDING|DESCENDING],
   *                     col2 [ASCENDING|DESCENDING]
   *             [ROWS BETWEEN {UNBOUNDED PRECEDING}
   *                           | {CURRENT ROW}
   *                           | {n PRECEDING}
   *                           | {n FOLLOWING}
   *                    AND    {UNBOUNDED FOLLOWING}
   *                           | {CURRENT ROW}
   *                           | {n PRECEDING}
   *                           | {n FOLLOWING}]] ) ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECT_OVER.html
   */
  sql_window_expression: $ =>
    seq(
      field("function", $.sql_function_call),
      gen.kw("over"),
      token.immediate("("),
      optional($.window_partition_by_spec),
      optional(
        seq($.window_order_by_spec, optional($.window_rows_between_spec)),
      ),
      ")",
    ),

  // ... [PARTITION BY sql_exp1, sql_exp2 ...]
  window_partition_by_spec: $ =>
    seq(...gen.kws("partition", "by"), gen.commaSep1($._sql_expression)),

  // ... [ORDER BY col1 [ASCENDING/DESCENDING], col2 ...]
  window_order_by_spec: $ => seq(...gen.kws("order", "by"), $.order_by_list),

  /*
   * ... ROWS BETWEEN {UNBOUNDED PRECEDING}
   *                  | {CURRENT ROW}
   *                  | {n PRECEDING}
   *                  | {n FOLLOWING}
   *           AND    {UNBOUNDED FOLLOWING}
   *                  | {CURRENT ROW}
   *                  | {n PRECEDING}
   *                  | {n FOLLOWING} ...
   */
  window_rows_between_spec: $ =>
    seq(
      ...gen.kws("rows", "between"),
      field(
        "low",
        choice(
          $.unbounded_preceding,
          $.current_row,
          $.preceding_rows_spec,
          $.following_rows_spec,
        ),
      ),
      gen.kw("and"),
      field(
        "high",
        choice(
          $.unbounded_following,
          $.current_row,
          $.preceding_rows_spec,
          $.following_rows_spec,
        ),
      ),
    ),

  current_row: _ => seq(...gen.kws("current", "row")),

  unbounded_preceding: _ => seq(...gen.kws("unbounded", "preceding")),

  unbounded_following: _ => seq(...gen.kws("unbounded", "following")),

  preceding_rows_spec: $ =>
    seq(
      field(
        "count",
        choice($.sql_host_expression, $.sql_host_variable, $.number),
      ),
      gen.kw("preceding"),
    ),

  following_rows_spec: $ =>
    seq(
      field(
        "count",
        choice($.sql_host_expression, $.sql_host_variable, $.number),
      ),
      gen.kw("following"),
    ),
};
