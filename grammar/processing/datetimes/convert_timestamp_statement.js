module.exports = {
  /**
   * CONVERT TIME STAMP time_stamp TIME ZONE tz
   *         INTO { DATE dat / TIME tim }
   *         [DAYLIGHT SAVING TIME dst].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCONVERT_TIME-STAMP.html
   */
  convert_timestamp_statement: $ => seq($.__convert_timestamp_statement_prefix, "."),

  __convert_timestamp_statement_prefix: $ =>
    seq(
      ...gen.kws("convert", "time", "stamp"),
      field("source", $.general_expression),
      $.time_zone_spec,
      gen.kw("into"),
      repeat1(choice($.time_spec, $.date_spec)),
      optional($.daylight_saving_time_spec),
    ),
};
