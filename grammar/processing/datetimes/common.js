module.exports = {
  _source_daylight_saving_time_spec: $ =>
    seq(
      ...gen.kws("daylight", "saving", "time"),
      field("value", $.general_expression),
    ),

  _result_daylight_saving_time_spec: $ =>
    seq(
      ...gen.kws("daylight", "saving", "time"),
      field("value", $.writable_expression),
    ),

  _source_time_spec: $ =>
    seq(
      gen.kw("time"),
      field("value", $.general_expression),
    ),

  _result_time_spec: $ =>
    seq(gen.kw("time"), field("value", $.writable_expression)),

  _source_date_spec: $ =>
    seq(
      gen.kw("date"),
      field("value", $.general_expression),
    ),

  _result_date_spec: $ =>
    seq(gen.kw("date"), field("value", $.writable_expression)),
};
