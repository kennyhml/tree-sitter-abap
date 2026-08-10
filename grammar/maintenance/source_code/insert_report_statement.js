module.exports = {
  /**
   * INSERT REPORT prog FROM itab
   *               [MAXIMUM WIDTH INTO wid]
   *               [program_properties].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPINSERT_REPORT.html
   */
  insert_report_statement: $ => seq($.__insert_report_statement_prefix, "."),

  __insert_report_statement_prefix: $ =>
    seq(
      ...gen.kws("insert", "report"),
      field("program", $._reference_operand),
      gen.kw("from"),
      field("source", $._reference_operand),
      optional($.maximum_width_spec),
      optional($.__insert_report_properties),
    ),

  __insert_report_properties: $ =>
    choice(
      $.keeping_directory_entry,
      repeat1(
        choice(
          $.program_type_spec,
          $.fixed_point_arithmetic_spec,
          $.version_spec,
        ),
      ),
      $.directory_entry_spec,
    ),

  keeping_directory_entry: _ =>
    seq(...gen.kws("keeping", "directory", "entry")),

  program_type_spec: $ =>
    seq(...gen.kws("program", "type"), field("type", $._simple_operand)),

  fixed_point_arithmetic_spec: $ =>
    seq(...gen.kws("fixed-point", "arithmetic"), field("value", $._simple_operand)),

  version_spec: $ =>
    seq(gen.kw("version"), field("version", $._simple_operand)),
};
