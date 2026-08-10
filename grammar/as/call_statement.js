module.exports = {
  /**
   * Call of a system function
   *
   * CALL cfunc [ID id1 FIELD f1].
   *
   * @see http://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCALL-.html
   */
  call_statement: $ => seq($.__call_statement_prefix, "."),

  __call_statement_prefix: $ =>
    seq(
      gen.kw("call"),
      field("name", $._simple_operand),
      repeat($.id_field_spec),
    ),
};
