module.exports = {
  /**
   * BREAK-POINT { [ID group]
   *             / [log_text] }.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPBREAK-POINT.html
   */
  breakpoint_statement: $ => seq($.__breakpoint_statement_prefix, "."),

  __breakpoint_statement_prefix: $ =>
    seq(
      gen.kw("break-point"),
      optional($.checkpoint_id_spec),
      optional(field("text", $._character_position)),
    ),
};
