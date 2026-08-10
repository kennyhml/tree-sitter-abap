module.exports = {
  /**
   * DESCRIBE TABLE itab [KIND knd] [LINES lin] [OCCURS n].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDESCRIBE_TABLE.html
   */
  describe_table_statement: $ => seq($.__describe_table_statement_prefix, "."),

  __describe_table_statement_prefix: $ =>
    seq(
      ...gen.kws("describe", "table"),
      field("subject", $._reference_operand),
      repeat($.__describe_table_addition),
    ),

  __describe_table_addition: $ =>
    choice($.describe_kind_spec, $.describe_lines_spec, $.describe_occurs_spec),

  describe_kind_spec: $ =>
    seq(gen.kw("kind"), field("destination", $._write_target)),

  describe_lines_spec: $ =>
    seq(gen.kw("lines"), field("destination", $._write_target)),

  describe_occurs_spec: $ =>
    seq(gen.kw("occurs"), field("destination", $._write_target)),
};
