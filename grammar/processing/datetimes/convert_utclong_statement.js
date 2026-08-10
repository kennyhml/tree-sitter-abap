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
      field("source", $.expression),
      gen.kw("into"),
      optional(alias($._result_date_spec, $.date_spec)),
      optional(alias($._result_time_spec, $.time_spec)),
      optional(
        alias($.__result_fractional_seconds_spec, $.fractional_seconds_spec),
      ),
      optional(
        alias(
          $._result_daylight_saving_time_spec,
          $.daylight_saving_time_spec,
        ),
      ),
      $.time_zone_spec,
    ),

  __result_fractional_seconds_spec: $ =>
    seq(
      ...gen.kws("fractional", "seconds"),
      field("value", $._write_target),
    ),
};
