module.exports = {
  /**
   * CONCATENATE {dobj1 dobj2 ...}|{LINES OF itab}
   *   INTO result
   *   [IN {CHARACTER|BYTE} MODE]
   *   [SEPARATED BY sep]
   *   [RESPECTING BLANKS].
   *
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCONCATENATE.html
   */
  concatenate_statement: $ => seq($.__concatenate_statement_prefix, "."),

  __concatenate_statement_prefix: $ =>
    seq(
      gen.kw("concatenate"),
      field("subject", $.__concat_subject_spec),
      $.into_spec,
      repeat(choice($.__concat_addition)),
    ),

  respecting_blanks: _ => seq(...gen.kws("respecting", "blanks")),

  separated_by_spec: $ =>
    seq(
      ...gen.kws("separated", "by"),
      field("separator", $._character_position),
    ),

  operand_list: $ => prec.right(repeat1($._simple_operand)),

  __concat_addition: $ =>
    choice(
      $._processing_mode_spec,
      $.separated_by_spec,
      $.respecting_blanks,
    ),

  __concat_subject_spec: $ => choice($.operand_list, $.lines_of_spec),
};
