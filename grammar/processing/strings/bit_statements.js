module.exports = {
  /**
   * SET BIT bitpos OF byte_string [TO val].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSET_BIT.html
   */
  set_bit_statement: $ =>
    seq(
      ...gen.kws("set", "bit"),
      field("position", $.numeric_expression),
      gen.kw("of"),
      field("subject", $.writable_expression),
      optional(seq(gen.kw("to"), field("to", $.numeric_expression))),
    ),

  /**
   * GET BIT bitpos OF byte_string INTO val.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPGET_BIT.html
   */
  get_bit_statement: $ =>
    seq(
      ...gen.kws("get", "bit"),
      field("position", $.numeric_expression),
      gen.kw("of"),
      field("subject", $.writable_expression),
      optional(seq(gen.kw("into"), field("into", $.writable_expression))),
    ),
};
