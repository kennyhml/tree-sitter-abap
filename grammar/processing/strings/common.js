module.exports = {
  /**
   * Specification of the processing mode (byte | character) for various statements.
   *
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENSTRING_PROCESSING_STATEMENTS.html
   */
  _processing_mode_spec: $ => choice($.in_character_mode, $.in_byte_mode),

  in_character_mode: _ => seq(...gen.kws("in", "character", "mode")),

  in_byte_mode: _ => seq(...gen.kws("in", "byte", "mode")),

  _pattern_spec: $ =>
    choice(
      $.first_occurrence_of_pattern,
      $.all_occurrences_of_pattern,
      field("pattern", $.__pattern),
    ),

  _subject_spec: $ =>
    seq(
      gen.kw("in"),
      optional($._section_spec),
      field("subject", $.data_object),
    ),

  /**
   *
   * ... SECTION [OFFSET off] [LENGTH len] OF ...
   *
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPFIND_SECTION_OF.html
   */
  _section_spec: $ =>
    seq(
      gen.kw("section"),
      repeat(choice($.section_offset, $.section_length)),
      gen.kw("of"),
    ),

  /**
   * ... {FIRST OCCURRENCE} OF ...
   *
   * Used in {@link find_statement} and {@link replace_statement}
   */
  first_occurrence_of_pattern: $ =>
    seq(...gen.kws("first", "occurrence", "of"), field("pattern", $.__pattern)),

  /**
   * ... {ALL OCCURRENCES} OF ...
   *
   * Used in {@link find_statement} and {@link replace_statement}
   */
  all_occurrences_of_pattern: $ =>
    seq(...gen.kws("all", "occurrences", "of"), field("pattern", $.__pattern)),

  section_offset: $ =>
    seq(gen.kw("offset"), field("offset", $.numeric_expression)),

  section_length: $ =>
    seq(gen.kw("length"), field("length", $.numeric_expression)),

  /**
   *
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREPLACE_PATTERN.html
   */
  __pattern: $ => choice($.substring, $.pcre, $.regex),

  substring: $ =>
    seq(optional(gen.kw("substring")), field("value", $.data_object)),
  pcre: $ => seq(gen.kw("pcre"), field("value", $.data_object)),
  regex: $ => seq(gen.kw("regex"), field("value", $.data_object)),

  /**
   * Specification of a case sensitivity in various string operations.
   *
   * `RESPECTING/IGNORING CASE`
   */
  _case_sensitivity_spec: $ => choice($.respecting_case, $.ignoring_case),

  respecting_case: _ => seq(...gen.kws("respecting", "case")),

  ignoring_case: _ => seq(...gen.kws("ignoring", "case")),

  /**
   * Specifies a target variable to safe the individual operations to.
   *
   * RESULTS result_tab|result_wa
   */
  results: $ => seq(gen.kw("results"), field("target", $.receiving_expression)),
};
