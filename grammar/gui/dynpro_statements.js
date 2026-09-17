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

  /*
   * SET PF-STATUS status [OF PROGRAM prog] [EXCLUDING fcode].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSET_PF-STATUS_DYNPRO.html
   */
  set_pf_status_statement: $ => seq($.__set_pf_status_statement_prefix, "."),

  __set_pf_status_statement_prefix: $ =>
    seq(
      ...gen.kws("set", "pf-status"),
      field("status", $._simple_operand),
      optional(field("program", $.of_program_spec)),
      optional(field("excluding", $.excluding_function_code_spec)),
    ),

  /*
   * SET PF-STATUS status [OF PROGRAM prog] [EXCLUDING fcode].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPGET_PF-STATUS_DYNPRO.html
   */
  get_pf_status_statement: $ => seq($.__get_pf_status_statement_prefix, "."),

  __get_pf_status_statement_prefix: $ =>
    seq(
      ...gen.kws("get", "pf-status"),
      field("status", $._modifiable_target),
      optional(field("program", $.of_program_spec)),
      optional(field("excluding", $.excluding_function_code_spec)),
    ),

  of_program_spec: $ =>
    seq(...gen.kws("of", "program"), field("program", $._simple_operand)),

  excluding_function_code_spec: $ =>
    seq(gen.kw("excluding"), field("fcode", $._simple_operand)),
};
