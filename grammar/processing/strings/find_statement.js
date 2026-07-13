module.exports = {
  /**
   * FIND [{FIRST OCCURRENCE}|{ALL OCCURRENCES} OF] pattern
   *   IN [section_of] dobj
   *   [IN {CHARACTER|BYTE} MODE]
   *   [find_options].
   *
   *  https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPFIND.html
   */
  find_statement: $ =>
    seq(
      gen.kw("find"),
      $._pattern_spec,
      $._subject_spec,
      repeat($.__find_addition),
      ".",
    ),

  /**
   * ...  [{RESPECTING|IGNORING} CASE]
   *       [MATCH COUNT  mcnt]
   *       { {[MATCH OFFSET moff]
   *          [MATCH LENGTH mlen]}
   *       | [RESULTS result_tab|result_wa] }
   *       [SUBMATCHES s1 s2 ...] ...
   *
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPFIND_OPTIONS.html
   */
  __find_addition: $ =>
    choice(
      $._case_sensitivity_spec,
      $._processing_mode_spec,

      $.match_count,
      $.match_line,
      $.match_offset,
      $.match_length,
      $.results,

      $.submatches,
    ),

  /**
   * Specifies subgroup registers in a {@link find} statement.
   *
   * `SUBMATCHES s1 s2 ...`
   */
  submatches: $ =>
    prec.right(seq(gen.kw("submatches"), repeat1($.receiving_expression))),

  // `MATCH COUNT cnt`
  match_count: $ =>
    seq(...gen.kws("match", "count"), field("target", $.receiving_expression)),

  match_line: $ =>
    seq(...gen.kws("match", "line"), field("target", $.receiving_expression)),

  // MATCH OFFSET off
  match_offset: $ =>
    seq(...gen.kws("match", "offset"), field("target", $.receiving_expression)),

  // MATCH LENGTH len
  match_length: $ =>
    seq(...gen.kws("match", "length"), field("target", $.receiving_expression)),
};
