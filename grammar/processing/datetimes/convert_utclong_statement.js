module.exports = {
  /**
   * CONVERT UTCLONG time_stamp
   *         INTO [DATE dat]
   *              [TIME tim [FRACTIONAL SECONDS fs]]
   *              [DAYLIGHT SAVING TIME dst]
   *              TIME ZONE tz.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCONVERT_UTCLONG.html
   */
  convert_utclong_statement: $ => seq($.__convert_utclong_statement_prefix, "."),

  __convert_utclong_statement_prefix: $ =>
    seq(
      ...gen.kws("convert", "utclong"),
      field("source", $.general_expression),
      gen.kw("into"),
      optional($.date_spec),
      optional($.time_spec),
      optional($.fractional_seconds_spec),
      optional($.daylight_saving_time_spec),
      $.time_zone_spec,
    ),
};
