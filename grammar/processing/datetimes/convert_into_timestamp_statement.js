module.exports = {
  /**
   * CONVERT DATE dat
   *        [TIME tim [DAYLIGHT SAVING TIME dst]]
   *         INTO TIME STAMP time_stamp TIME ZONE tz.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCONVERT_DATE_TIME-STAMP.html
   */
  convert_into_timestamp_statement: $ => seq($.__convert_into_timestamp_statement_prefix, "."),

  __convert_into_timestamp_statement_prefix: $ =>
    seq(
      ...gen.kws("convert"),

      alias($._source_date_spec, $.date_spec),
      optional(alias($._source_time_spec, $.time_spec)),
      optional(
        alias(
          $._source_daylight_saving_time_spec,
          $.daylight_saving_time_spec,
        ),
      ),

      ...gen.kws("into", "time", "stamp"),
      field("destination", $._write_target),
      $.time_zone_spec,
    ),
};
