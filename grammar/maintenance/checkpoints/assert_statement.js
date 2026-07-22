module.exports = {
  /**
   * ASSERT [ [ID group [SUBKEY sub]]
   * [FIELDS val1 val2 ...]
   *  CONDITION ] log_exp.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPASSERT.html
   */
  assert_statement: $ => seq($.__assert_statement_prefix, "."),

  __assert_statement_prefix: $ =>
    seq(
      gen.kw("assert"),
      optional($.checkpoint_id_spec),
      optional($.checkpoint_fields_spec),
      $.assert_condition_spec,
    ),

  assert_condition_spec: $ =>
    seq(
      optional(gen.kw("condition")),
      field("conditon", $._logical_expression),
    ),
};
