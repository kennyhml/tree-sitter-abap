module.exports = {
  /**
   * Delete statement to delete values from an internal table. Not to
   * be confused with the abap sql operation of the same name.
   *
   * DELETE { itab_line | itab_lines | duplicates }.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDELETE_ITAB.html
   */
  delete_statement: $ => seq($.__delete_statement_prefix, "."),

  __delete_statement_prefix: $ =>
    gen.chainable("delete", $.__delete_itab_variants),

  // Different variants to perform the deletion - all specified in this module.
  __delete_itab_variants: $ =>
    choice(
      $.delete_itab_key_spec,
      alias($._itab_index_spec, $.delete_itab_index_spec),
      $.delete_itab_lines_spec,
      $.delete_itab_duplicates_spec,
    ),

  /**
   * Search key specification for deleting lines from the internal table.
   *
   * Syntactically, this differs from other search key specifications.
   *
   * ... TABLE itab { FROM wa [USING KEY keyname] }
   *              | { WITH TABLE KEY [keyname COMPONENTS]
   *                {comp_name1|(name1)} = operand1
   *                {comp_name2|(name2)} = operand2 } ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDELETE_ITAB_KEY.html
   */
  delete_itab_key_spec: $ =>
    seq(
      gen.kw("table"),
      field("subject", $._modifiable_target),
      choice($.from_work_area_spec, $.table_key_spec),
    ),

  /**
   * Delete from internal table based on an itab lines specification.
   *
   * ... itab [USING KEY keyname] [FROM idx1] [TO idx2]
   *                              [STEP n]|[WHERE log_exp|(cond_syntax)] ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDELETE_ITAB_LINES.html
   */
  delete_itab_lines_spec: $ =>
    seq(field("subject", $._modifiable_target), $.itab_lines_spec),

  /**
   * Delete duplicates from internal table comparing certain fields.
   *
   * ... ADJACENT DUPLICATES FROM itab [USING KEY keyname]
   *           [COMPARING { comp1 comp2 ...}|{ALL FIELDS}] ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDELETE_DUPLICATES.html
   */
  delete_itab_duplicates_spec: $ =>
    seq(
      $.__adjacent_duplicates_from,
      field("subject", $._modifiable_target),
      repeat(choice($.using_key_spec, $.comparing_spec)),
    ),

  __adjacent_duplicates_from: _ =>
    seq(...gen.kws("adjacent", "duplicates", "from")),
};
