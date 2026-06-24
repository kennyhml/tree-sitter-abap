module.exports = {

  /**
   * REPORT rep [list_options] 
   *            [MESSAGE-ID mid] 
   *            [DEFINING DATABASE ldb] 
   *            [REDUCED FUNCTIONALITY].
   * 
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREPORT.html
   */
  report_statement: $ => seq(
    gen.kw("report"),
    field("name", $.identifier),
    repeat($.__report_statement_addition),
    "."
  ),

  __report_statement_addition: $ => choice(
    $.reduced_functionality,
    $.no_standard_page_heading,
    $.defining_database,
    $.line_size,
    $.line_count,
    $.default_message_class
  ),

  reduced_functionality: _ => seq(...gen.kws("reduced", "functionality")),

  no_standard_page_heading: _ => seq(...gen.kws("no", "standard", "page", "heading")),

  defining_database: $ => seq(
    ...gen.kws("defining", "database"),
    field("name", $.identifier)
  ),

  line_size: $ => seq(
    gen.kw("line-size"),
    field("size", $.number)
  ),

  line_count: $ => seq(
    gen.kw("line-count"),
    field("page_lines", $.number),
    token.immediate("("),
    field("footer_lines", $._immediate_number),
    token.immediate(")")
  ),

  default_message_class: $ => seq(
    gen.kw("message-id"),
    field("name", $.identifier)
  ),
}
