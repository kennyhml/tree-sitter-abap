module.exports = {
  /**
   * Call of a system function
   *
   * CALL cfunc [ID id1 FIELD f1].
   *
   * @see http://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCALL-.html
   */
  call_statement: $ =>
    seq(
      gen.kw("call"),
      field("name", $.data_object),
      repeat($.id_field_spec),
      ".",
    ),
};
