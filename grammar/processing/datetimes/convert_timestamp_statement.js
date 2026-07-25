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
      repeat1(
        choice(
          alias($._result_time_spec, $.time_spec),
          alias($._result_date_spec, $.date_spec),
        ),
      ),
      optional(
        alias(
          $._result_daylight_saving_time_spec,
          $.daylight_saving_time_spec,
        ),
      ),
    ),
};
