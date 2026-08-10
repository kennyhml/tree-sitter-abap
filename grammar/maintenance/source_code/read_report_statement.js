module.exports = {
  /**
   * READ REPORT prog INTO itab [MAXIMUM WIDTH INTO wid].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREAD_REPORT.html
   */
  read_report_statement: $ => seq($.__read_report_statement_prefix, "."),

  __read_report_statement_prefix: $ =>
    seq(
      ...gen.kws("read", "report"),
      field("program", $._reference_operand),
      gen.kw("into"),
      field("destination", $._modifiable_target),
      optional($.maximum_width_spec),
    ),
};
