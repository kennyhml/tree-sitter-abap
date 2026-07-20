module.exports = {
  /**
   * CONVERT DATE dat
   *        [TIME tim [DAYLIGHT SAVING TIME dst]]
   *         INTO TIME STAMP time_stamp TIME ZONE tz.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCONVERT_DATE_TIME-STAMP.html
   */
  ...gen.periodTerminated("convert_into_timestamp_statement", $ =>
    seq(
      ...gen.kws("convert"),

      $.date_spec,
      optional($.time_spec),
      optional($.daylight_saving_time_spec),

      ...gen.kws("into", "time", "stamp"),
      field("destination", $.writable_expression),
      $.time_zone_spec,
    ),
  ),
};
