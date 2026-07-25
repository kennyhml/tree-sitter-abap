module.exports = {
  /**
   * READ TEXTPOOL prog INTO itab LANGUAGE lang.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREAD_TEXTPOOL.html
   */
  read_textpool_statement: $ => seq($.__read_textpool_statement_prefix, "."),

  __read_textpool_statement_prefix: $ =>
    seq(
      ...gen.kws("read", "textpool"),
      field("program", $.named_data_object),
      gen.kw("into"),
      field("destination", $.writable_expression),
      $.language_spec,
    ),

  /**
   * INSERT TEXTPOOL prog FROM itab LANGUAGE lang.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPINSERT_TEXTPOOL.html
   */
  insert_textpool_statement: $ => seq($.__insert_textpool_statement_prefix, "."),

  __insert_textpool_statement_prefix: $ =>
    seq(
      ...gen.kws("insert", "textpool"),
      field("program", $.named_data_object),
      gen.kw("from"),
      field("source", $.named_data_object),
      $.language_spec,
    ),
};
