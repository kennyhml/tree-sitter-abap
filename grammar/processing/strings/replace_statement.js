module.exports = {
  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREPLACE.html
  replace_statement: $ =>
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
      $.substitute_with,
      repeat($.__replace_addition),
      ".",
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
      $.substitute_with,
      optional($._processing_mode_spec),
      ".",
    ),

  substitute_with: $ => seq(gen.kw("with"), field("value", $.data_object)),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREPLACE_OPTIONS.html
  __replace_addition: $ =>
    choice(
      $.verbatim,
      $._processing_mode_spec,
      $._case_sensitivity_spec,

      $.replacement_count,
      $.replacement_offset,
      $.replacement_length,

      $.results,
    ),

  // `replacement COUNT cnt`
  replacement_count: $ =>
    seq(
      ...gen.kws("replacement", "count"),
      field("target", $.receiving_expression),
    ),

  // replacement OFFSET off
  replacement_offset: $ =>
    seq(
      ...gen.kws("replacement", "offset"),
      field("target", $.receiving_expression),
    ),

  // replacement LENGTH len
  replacement_length: $ =>
    seq(
      ...gen.kws("replacement", "length"),
      field("target", $.receiving_expression),
    ),

  verbatim: _ => gen.kw("verbatim"),
};
