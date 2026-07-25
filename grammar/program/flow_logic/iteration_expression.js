module.exports = {
  /**
   * ... REDUCE|NEW|VALUE type( ... FOR ... UNTIL|WHILE ...
   *                                  / ... IN ... ...) ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENFOR.html
   */
  iteration_expression: $ => choice($.conditional_iteration, $.table_iteration),

  /**
   * ... FOR var = rhs [THEN expr] UNTIL|WHILE log_exp [ let_exp ] ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENFOR_CONDITIONAL.html
   */
  conditional_iteration: $ =>
    seq(
      gen.kw("for"),

      field("init", $.assignment),
      optional(field("next", $.then_spec)),
      $.iteration_condition,

      optional($.let_expression),
    ),

  // ... [THEN expr] ...
  then_spec: $ => seq(gen.kw("then"), $.general_expression),

  // ... UNTIL / WHILE log_exp ...
  iteration_condition: $ => choice($.while_spec, $.until_spec),

  while_spec: $ =>
    seq(gen.kw("while"), field("condition", $._logical_expression)),
};
