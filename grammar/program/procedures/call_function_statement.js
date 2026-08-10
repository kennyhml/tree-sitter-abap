module.exports = {
  /**
   * 1. General Function Module Call
   *    CALL FUNCTION func { parameter_list | parameter_tables }.
   *
   * 2. Remote Function Call
   *   CALL FUNCTION ... DESTINATION ...
   *
   * 3. Registration of an Update Task Function Module
   *   CALL FUNCTION update_function IN UPDATE TASK
   *        [EXPORTING p1 = a1 p2 = a2 ...]
   *        [TABLES t1 = itab1 t2 = itab2 ...].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCALL_FUNCTION.html
   */
  call_function_statement: $ => seq($.__call_function_statement_prefix, "."),

  __call_function_statement_prefix: $ =>
    seq(
      ...gen.kws("call", "function"),
      field("name", $._character_position),
      repeat(
        choice(
          $.destination_spec,
          $.in_remote_session_spec,
          $.starting_new_task_spec,
          $.asynchronous_callback_spec,
          $.in_background_unit_spec,
          $.in_background_task_spec,
          $.in_update_task_spec,
        ),
      ),
      optional($.call_argument_list),
    ),

  // ... [DESTINATION {dest|{IN GROUP {group|DEFAULT}}}] ...
  destination_spec: $ =>
    seq(gen.kw("destination"), choice($._simple_operand, $.in_group_spec)),

  // ... {IN GROUP {group|DEFAULT} ...
  in_group_spec: $ =>
    seq(
      ...gen.kws("in", "group"),
      field("group", choice($._reference_operand, gen.kw("default"))),
    ),

  in_remote_session_spec: $ =>
    seq(
      ...gen.kws("in", "remote", "session"),
      field("session", $._reference_operand),
    ),

  starting_new_task_spec: $ =>
    seq(...gen.kws("starting", "new", "task"), field("task_id", $._simple_operand)),

  asynchronous_callback_spec: $ =>
    seq(
      choice(
        seq(
          gen.kw("calling"),
          field("method", choice($.identifier, $.component_selection)),
        ),
        seq(gen.kw("performing"), field("routine", $.identifier)),
      ),
      ...gen.kws("on", "end", "of", "task"),
    ),

  in_background_unit_spec: $ =>
    seq(
      ...gen.kws("in", "background", "unit"),
      field("name", $._reference_operand),
    ),

  /**
   * Despite being an obsolete language element, this is still used quite often.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCALL_FUNCTION_BACKGROUND_TASK.html
   */
  in_background_task_spec: $ =>
    prec.right(
      seq(
        ...gen.kws("in", "background", "task"),
        optional($.as_separate_unit),
      ),
    ),

  in_update_task_spec: _ => seq(...gen.kws("in", "update", "task")),

  as_separate_unit: _ => seq(...gen.kws("as", "separate", "unit")),
};
