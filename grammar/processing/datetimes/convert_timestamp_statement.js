module.exports = {
  /**
   * CONVERT TIME STAMP time_stamp TIME ZONE tz
   *         INTO { DATE dat / TIME tim }
   *         [DAYLIGHT SAVING TIME dst].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCONVERT_TIME-STAMP.html
   */
  convert_timestamp_statement: $ =>
    seq(
      ...gen.kws("convert", "time", "stamp"),
      field("source", $.general_expression),
      ...gen.kws("time", "zone"),
      field("time_zone", $.general_expression),
      gen.kw("into"),
      repeat1(
        choice(
          seq(gen.kw("date"), field("date", $.writable_expression)),
          seq(gen.kw("time"), field("time", $.writable_expression)),
        ),
      ),
      optional($.convert_daylight_saving_time),
      ".",
    ),

  convert_daylight_saving_time: $ =>
    seq(
      ...gen.kws("daylight", "saving", "time"),
      field("destination", $.writable_expression),
    ),
};
