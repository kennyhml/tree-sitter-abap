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
      $.source_error_message_spec,
      $.source_error_include_spec,
      $.source_error_line_spec,
      $.source_error_word_spec,
      $.source_error_offset_spec,
      $.source_error_message_id_spec,
      $.generate_shortdump_id_spec,
    ),

  generate_shortdump_id_spec: $ =>
    seq(gen.kw("shortdump-id"), field("destination", $.writable_expression)),
};
