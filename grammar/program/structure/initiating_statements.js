module.exports = {
  /**
   * PROGRAM prog [list_options]
   *              [MESSAGE-ID mid]
   *              [REDUCED FUNCTIONALITY].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPPROGRAM.html
   */
  ...gen.periodTerminated("program_statement", $ =>
    seq(
      gen.kw("program"),
      field("name", $.identifier),
      repeat($.__program_statement_addition),
    ),
  ),

  __program_statement_addition: $ =>
    choice(
      $.reduced_functionality,
      $.no_standard_page_heading,
      $.line_size,
      $.line_count,
      $.default_message_class,
    ),

  /**
   * FUNCTION-POOL fpool [list_options]
   *                     [MESSAGE-ID mid].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPFUNCTION-POOL.html
   */
  ...gen.periodTerminated("function_pool_statement", $ =>
    seq(
      gen.kw("function-pool"),
      field("name", $.identifier),
      repeat($.__function_pool_statement_addition),
    ),
  ),

  __function_pool_statement_addition: $ =>
    choice(
      $.no_standard_page_heading,
      $.line_size,
      $.line_count,
      $.default_message_class,
    ),

  /**
   * REPORT rep [list_options]
   *            [MESSAGE-ID mid]
   *            [DEFINING DATABASE ldb]
   *            [REDUCED FUNCTIONALITY].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREPORT.html
   */
  ...gen.periodTerminated("report_statement", $ =>
    seq(
      gen.kw("report"),
      field("name", $.identifier),
      repeat($.__report_statement_addition),
    ),
  ),

  __report_statement_addition: $ =>
    choice(
      $.reduced_functionality,
      $.no_standard_page_heading,
      $.defining_database,
      $.line_size,
      $.line_count,
      $.default_message_class,
    ),

  /**
   * CLASS-POOL fpool [MESSAGE-ID mid].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS-POOL.html
   */
  ...gen.periodTerminated("class_pool_statement", $ =>
    seq(
      gen.kw("class-pool"),
      field("name", $.identifier),
      optional($.default_message_class),
    ),
  ),

  /**
   * INTERFACE-POOL.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPINTERFACE-POOL.html
   */
  ...gen.periodTerminated("interface_pool_statement", $ =>
    seq(gen.kw("interface-pool")),
  ),

  /**
   * TYPE-POOL.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPTYPE-POOL.html
   */
  ...gen.periodTerminated("type_pool_statement", $ =>
    seq(gen.kw("type-pool")),
  ),

  reduced_functionality: _ => seq(...gen.kws("reduced", "functionality")),

  no_standard_page_heading: _ =>
    seq(...gen.kws("no", "standard", "page", "heading")),

  defining_database: $ =>
    seq(...gen.kws("defining", "database"), field("name", $.identifier)),

  line_size: $ => seq(gen.kw("line-size"), field("size", $.number)),

  line_count: $ =>
    seq(
      gen.kw("line-count"),
      field("page_lines", $.number),
      token.immediate("("),
      field("footer_lines", $._immediate_number),
      token.immediate(")"),
    ),

  default_message_class: $ =>
    seq(gen.kw("message-id"), field("name", $.identifier)),
};
