module.exports = {
  /**
   * GET RUN TIME FIELD rtime.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPGET_RUN_TIME.html
   */
  ...gen.periodTerminated("get_run_time_statement", $ =>
    seq(
      ...gen.kws("get", "run", "time", "field"),
      field("destination", $.writable_expression),
    ),
  ),

  /**
   * SET RUN TIME ANALYZER {ON|OFF}.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSET_RUN_TIME_ANALYZER.html
   */
  set_run_time_analyzer_statement: $ =>
    seq(
      ...gen.kws("set", "run", "time", "analyzer"),
      field(
        "value",
        choice(alias(gen.kw("on"), $.on), alias(gen.kw("off"), $.off)),
      ),
    ),

  /**
   * SET RUN TIME CLOCK RESOLUTION
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSET_RUN_TIME_CLOCK_RESOLUTION.html
   */
  set_run_time_clock_resolution_statement: $ =>
    seq(
      ...gen.kws("set", "run", "time", "clock", "resolution"),
      field(
        "value",
        choice(alias(gen.kw("high"), $.high), alias(gen.kw("low"), $.low)),
      ),
    ),
};
