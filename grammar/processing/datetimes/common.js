module.exports = {
  _source_daylight_saving_time_spec: $ =>
    seq(
      ...gen.kws("daylight", "saving", "time"),
      field("value", $.expression),
    ),

  _result_daylight_saving_time_spec: $ =>
    seq(
      ...gen.kws("daylight", "saving", "time"),
      field("value", $._write_target),
    ),

  _source_time_spec: $ =>
    seq(
      gen.kw("time"),
      field("value", $.expression),
    ),

  _result_time_spec: $ =>
    seq(gen.kw("time"), field("value", $._write_target)),

  _source_date_spec: $ =>
    seq(
      gen.kw("date"),
      field("value", $.expression),
    ),

  _result_date_spec: $ =>
    seq(gen.kw("date"), field("value", $._write_target)),
};
