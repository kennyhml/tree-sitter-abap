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
  convert_into_utclong_statement: $ => seq($.__convert_into_utclong_statement_prefix, "."),

  __convert_into_utclong_statement_prefix: $ =>
    seq(
      ...gen.kws("convert"),
      alias($._source_date_spec, $.date_spec),
      alias($._source_time_spec, $.time_spec),
      optional(
        alias($.__source_fractional_seconds_spec, $.fractional_seconds_spec),
      ),
      optional(
        alias(
          $._source_daylight_saving_time_spec,
          $.daylight_saving_time_spec,
        ),
      ),
      $.time_zone_spec,
      ...gen.kws("into", "utclong"),
      field("destination", $.writable_expression),
    ),

  __source_fractional_seconds_spec: $ =>
    seq(
      ...gen.kws("fractional", "seconds"),
      field("value", $.general_expression),
    ),
};
