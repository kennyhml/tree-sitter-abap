module.exports = {
  /**
   * GET REFERENCE OF dobj INTO dref.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPGET_REFERENCE.html
   */
  get_reference_statement: $ => seq($.__get_reference_statement_prefix, "."),

  __get_reference_statement_prefix: $ =>
    seq(
      ...gen.kws("get", "reference", "of"),
      field("source", $.general_expression),
      gen.kw("into"),
      field(
        "destination",
        choice($.named_data_object, $.declaration_expression),
      ),
    ),
};
