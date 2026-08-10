module.exports = {
  /**
   * RECEIVE RESULTS FROM FUNCTION func
   *   [KEEPING TASK]
   *   [IMPORTING p1 = a1 p2 = a2 ...]
   *   [TABLES t1 = itab1 t2 = itab2 ...]
   *   [CHANGING p1 = a1 p2 = a2 ...]
   *   [EXCEPTIONS exc1 = n1 exc2 = n2 ...].
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPRECEIVE.html
   */
  receive_results_statement: $ =>
    seq($.__receive_results_statement_prefix, "."),

  __receive_results_statement_prefix: $ =>
    seq(
      ...gen.kws("receive", "results", "from", "function"),
      field("name", $._character_position),
      optional($.keeping_task),
      optional($.call_argument_list),
    ),

  keeping_task: _ => seq(...gen.kws("keeping", "task")),
};
