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
  ...gen.periodTerminated("concatenate_statement", $ =>
    seq(
      gen.kw("concatenate"),
      field("subject", $.__concat_subject_spec),
      $.into,
      repeat(choice($.__concat_addition)),
    ),
  ),

  respecting_blanks: _ => seq(...gen.kws("respecting", "blanks")),

  separated_by: $ =>
    seq(
      ...gen.kws("separated", "by"),
      field("separator", $.character_like_expression),
    ),

  data_object_list: $ => prec.right(repeat1($.data_object)),

  __concat_addition: $ =>
    choice($._processing_mode_spec, $.separated_by, $.respecting_blanks),

  __concat_subject_spec: $ => choice($.data_object_list, $.lines_of),
};
