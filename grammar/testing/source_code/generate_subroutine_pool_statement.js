module.exports = {
  /**
   * GENERATE SUBROUTINE POOL itab NAME prog [error_handling].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPGENERATE_SUBROUTINE_POOL.html
   */
  generate_subroutine_pool_statement: $ =>
    seq(
      ...gen.kws("generate", "subroutine", "pool"),
      field("source", $.named_data_object),
      gen.kw("name"),
      field("program", $.writable_expression),
      repeat($.__generate_subroutine_pool_addition),
      ".",
    ),

  __generate_subroutine_pool_addition: $ =>
    choice(
      $.generate_message_spec,
      $.generate_include_spec,
      $.generate_line_spec,
      $.generate_word_spec,
      $.generate_offset_spec,
      $.generate_message_id_spec,
      $.generate_shortdump_id_spec,
    ),

  generate_message_spec: $ =>
    seq(gen.kw("message"), field("destination", $.writable_expression)),

  generate_include_spec: $ =>
    seq(gen.kw("include"), field("destination", $.writable_expression)),

  generate_line_spec: $ =>
    seq(gen.kw("line"), field("destination", $.writable_expression)),

  generate_word_spec: $ =>
    seq(gen.kw("word"), field("destination", $.writable_expression)),

  generate_offset_spec: $ =>
    seq(gen.kw("offset"), field("destination", $.writable_expression)),

  generate_message_id_spec: $ =>
    seq(gen.kw("message-id"), field("destination", $.writable_expression)),

  generate_shortdump_id_spec: $ =>
    seq(gen.kw("shortdump-id"), field("destination", $.writable_expression)),
};
