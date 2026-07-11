module.exports = {
  /**
   * CONVERT TEXT text INTO SORTABLE CODE hex.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCONVERT_TEXT.html
   */
  convert_text_statement: $ =>
    seq(
      ...gen.kws("convert", "text"),
      field("source", $.general_expression),
      ...gen.kws("into", "sortable", "code"),
      field(
        "destination",
        choice($.named_data_object, $.declaration_expression),
      ),
      ".",
    ),
};
