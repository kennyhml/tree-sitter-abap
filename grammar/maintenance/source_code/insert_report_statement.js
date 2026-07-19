module.exports = {
  /**
   * INSERT REPORT prog FROM itab
   *               [MAXIMUM WIDTH INTO wid]
   *               [program_properties].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPINSERT_REPORT.html
   */
  insert_report_statement: $ =>
    seq(
      ...gen.kws("insert", "report"),
      field("program", $.named_data_object),
      gen.kw("from"),
      field("source", $.named_data_object),
      optional($.report_maximum_width_spec),
      optional($.__insert_report_properties),
      ".",
    ),

  __insert_report_properties: $ =>
    choice(
      $.keeping_directory_entry,
      repeat1(
        choice(
          $.insert_report_program_type_spec,
          $.insert_report_arithmetic_spec,
          $.insert_report_version_spec,
        ),
      ),
      $.program_directory_entry_spec,
    ),

  keeping_directory_entry: _ =>
    seq(...gen.kws("keeping", "directory", "entry")),

  insert_report_program_type_spec: $ =>
    seq(...gen.kws("program", "type"), field("type", $.data_object)),

  insert_report_arithmetic_spec: $ =>
    seq(...gen.kws("fixed-point", "arithmetic"), field("value", $.data_object)),

  insert_report_version_spec: $ =>
    seq(gen.kw("version"), field("version", $.data_object)),
};
