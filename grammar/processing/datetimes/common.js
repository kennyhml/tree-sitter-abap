module.exports = {
  time_zone_spec: $ =>
    seq(...gen.kws("time", "zone"), field("value", $.general_expression)),

  daylight_saving_time_spec: $ =>
    seq(
      ...gen.kws("daylight", "saving", "time"),
      field("value", choice($.declaration_expression, $.general_expression)),
    ),

  time_spec: $ =>
    seq(
      gen.kw("time"),
      field("value", choice($.general_expression, $.declaration_expression)),
    ),

  date_spec: $ =>
    seq(
      gen.kw("date"),
      field("value", choice($.declaration_expression, $.general_expression)),
    ),
};
