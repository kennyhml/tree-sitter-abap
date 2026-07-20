module.exports = {
  /**
   * GET TIME [FIELD tim].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPGET_TIME.html
   */
  ...gen.periodTerminated("get_time_statement", $ =>
    seq(
      ...gen.kws("get", "time"),
      optional(
        seq(gen.kw("field"), field("destination", $.writable_expression)),
      ),
    ),
  ),
};
