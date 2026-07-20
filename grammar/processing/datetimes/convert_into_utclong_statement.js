module.exports = {
  /**
   * CONVERT DATE dat
   *         TIME tim [FRACTIONAL SECONDS fs]
   *         [DAYLIGHT SAVING TIME dst]
   *         TIME ZONE tz
   *         INTO UTCLONG time_stamp.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCONVERT_DATE_UTCLONG.html
   */
  ...gen.periodTerminated("convert_into_utclong_statement", $ =>
    seq(
      ...gen.kws("convert"),
      $.date_spec,
      $.time_spec,
      optional($.fractional_seconds_spec),
      optional($.daylight_saving_time_spec),
      $.time_zone_spec,
      ...gen.kws("into", "utclong"),
      field("destination", $.writable_expression),
    ),
  ),
};
