module.exports = {
  /**
   * ENHANCEMENT id.
   * ...
   * ENDENHANCEMENT.
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPENHANCEMENT.html
   */
  enhancement_statement: $ => seq($.__enhancement_statement_prefix, "."),

  __enhancement_statement_prefix: $ =>
    seq(
      gen.kw("enhancement"),
      field("number", $.number),
      field("name", $.identifier),
      ".",
      field("body", optional($.statement_block)),
      gen.kw("endenhancement"),
    ),
};
