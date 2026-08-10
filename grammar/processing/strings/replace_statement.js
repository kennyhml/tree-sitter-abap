module.exports = {
  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREPLACE.html
  replace_statement: $ => seq($.__replace_statement_prefix, "."),

  __replace_statement_prefix: $ =>
    choice($.__pattern_based_replacement, $.__position_based_replacement),

  /**
   * REPLACE [{FIRST OCCURRENCE}| {ALL OCCURRENCES} OF] pattern
   *   IN [section_of] dobj WITH new
   *   [IN {CHARACTER|BYTE} MODE]
   *   [replace_options].
   *
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREPLACE_IN_PATTERN.html
   */
  __pattern_based_replacement: $ =>
    seq(
      gen.kw("replace"),
      $._pattern_spec,
      $._subject_spec,
      $.substitute_with_spec,
      repeat($.__replace_addition),
    ),

  /**
   * REPLACE SECTION [OFFSET off] [LENGTH len] OF dobj WITH new
   *                 [IN {CHARACTER|BYTE} MODE].
   *
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREPLACE_IN_POSITION.html
   */
  __position_based_replacement: $ =>
    seq(
      gen.kw("replace"),
      $._subject_spec,
      $.substitute_with_spec,
      optional($._processing_mode_spec),
    ),

  substitute_with_spec: $ =>
    seq(gen.kw("with"), field("value", $._character_position)),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREPLACE_OPTIONS.html
  __replace_addition: $ =>
    choice(
      $.verbatim,
      $._processing_mode_spec,
      $._case_sensitivity_spec,

      $.replacement_count_spec,
      $.replacement_line_spec,
      $.replacement_offset_spec,
      $.replacement_length_spec,

      $.results_spec,
    ),

  // `replacement COUNT cnt`
  replacement_count_spec: $ =>
    seq(
      ...gen.kws("replacement", "count"),
      field("target", $._result_target),
    ),

  // replacement line lin
  replacement_line_spec: $ =>
    seq(
      ...gen.kws("replacement", "line"),
      field("target", $._result_target),
    ),

  // replacement OFFSET off
  replacement_offset_spec: $ =>
    seq(
      ...gen.kws("replacement", "offset"),
      field("target", $._result_target),
    ),

  // replacement LENGTH len
  replacement_length_spec: $ =>
    seq(
      ...gen.kws("replacement", "length"),
      field("target", $._result_target),
    ),

  verbatim: _ => gen.kw("verbatim"),
};
