module.exports = {
  /**
   * SET BIT bitpos OF byte_string [TO val].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSET_BIT.html
   */
  set_bit_statement: $ =>
    seq(
      ...gen.kws("set", "bit"),
      field("position", $._numeric_position),
      gen.kw("of"),
      field("subject", $._write_target),
      optional(seq(gen.kw("to"), field("to", $._numeric_position))),
    ),

  /**
   * GET BIT bitpos OF byte_string INTO val.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPGET_BIT.html
   */
  get_bit_statement: $ =>
    seq(
      ...gen.kws("get", "bit"),
      field("position", $._numeric_position),
      gen.kw("of"),
      field("subject", $._write_target),
      optional(seq(gen.kw("into"), field("into", $._write_target))),
    ),
};
