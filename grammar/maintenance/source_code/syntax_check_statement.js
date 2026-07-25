module.exports = {
  /**
   * SYNTAX-CHECK FOR itab MESSAGE mess LINE lin WORD wrd
   *              [PROGRAM prog] [DIRECTORY ENTRY dir]
   *              [WITH CURRENT SWITCHSTATES]
   *              [error_handling].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSYNTAX-CHECK_FOR_ITAB.html
   */
  syntax_check_statement: $ => seq($.__syntax_check_statement_prefix, "."),

  __syntax_check_statement_prefix: $ =>
    seq(
      ...gen.kws("syntax-check", "for"),
      field("source", $.named_data_object),
      $.source_error_message_spec,
      $.source_error_line_spec,
      $.source_error_word_spec,
      repeat($.__syntax_check_addition),
    ),

  __syntax_check_addition: $ =>
    choice(
      $.program_spec,
      $.directory_entry_spec,
      $.with_current_switchstates,
      $.source_error_include_spec,
      $.source_error_offset_spec,
      $.source_error_message_id_spec,
    ),

  program_spec: $ =>
    seq(gen.kw("program"), field("program", $.named_data_object)),

  with_current_switchstates: _ =>
    seq(...gen.kws("with", "current", "switchstates")),
};
