module.exports = {
  /**
   * TRANSFER dobj TO dset [LENGTH len] [NO END OF LINE].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPTRANSFER.html
   */
  transfer_statement: $ => seq($.__transfer_statement_prefix, "."),

  __transfer_statement_prefix: $ =>
    seq(
      gen.kw("transfer"),
      field("source", $._contextual_simple_operand),
      gen.kw("to"),
      field("destination", $._simple_operand),
      optional($.transfer_length_spec),
      optional($.no_end_of_line),
    ),

  no_end_of_line: _ => seq(...gen.kws("no", "end", "of", "line")),

  transfer_length_spec: $ =>
    seq(gen.kw("length"), field("length", $._simple_operand)),
};
