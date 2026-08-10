module.exports = {
  /**
   * INSERT line_spec INTO itab_position [result].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPINSERT_ITAB.html
   */
  insert_statement: $ => seq($.__insert_statement_prefix, "."),

  __insert_statement_prefix: $ =>
    seq(
      gen.kw("insert"),
      field("line", $._line_spec),
      gen.kw("into"),
      $.__insert_position,
      optional(field("result", $._itab_mutation_result)),
    ),

  /**
   * ... {TABLE itab}
   *   | {itab INDEX idx}
   *   | {itab} ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPINSERT_ITAB_POSITION.html
   */
  __insert_position: $ => choice($.into_table_spec, $.at_index),

  into_table_spec: $ =>
    seq(gen.kw("table"), field("subject", $._modifiable_target)),

  at_index: $ =>
    seq(
      field("subject", $._modifiable_target),
      // can be ommitted inside a loop at statement
      optional(seq(gen.kw("index"), field("index", $._numeric_position))),
    ),

};
