module.exports = {
  /**
   * PROGRAM prog [list_options]
   *              [MESSAGE-ID mid]
   *              [REDUCED FUNCTIONALITY].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPPROGRAM.html
   */
  program_statement: $ =>
    seq(
      gen.kw("program"),
      field("name", $.identifier),
      repeat($.__program_statement_addition),
      ".",
    ),

  __program_statement_addition: $ =>
    choice(
      $.reduced_functionality,
      $.no_standard_page_heading,
      $.line_size,
      $.line_count,
      $.default_message_class,
    ),
};
