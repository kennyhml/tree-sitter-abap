module.exports = {
  /**
   * WRITE {source|(source_name)} TO destination
   *      [format_options].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPWRITE_TO.html
   */
  write_to_statement: $ => seq($.__write_to_statement_prefix, "."),

  __write_to_statement_prefix: $ =>
    seq(
      gen.kw("write"),
      field("source", choice($.general_expression, $.dynamic_spec)),
      gen.kw("to"),
      field("destination", $.general_expression),
      repeat($.__format_option),
    ),

  /**
   *... [LEFT-JUSTIFIED|CENTERED|RIGHT-JUSTIFIED]
   *    [EXPONENT exp]
   *    [NO-GROUPING]
   *    [NO-SIGN]
   *    [NO-ZERO]
   *    [CURRENCY cur]
   *    [DECIMALS dec]
   *    [ROUND scale]
   *    [UNIT unit]
   *    [ENVIRONMENT TIME FORMAT]
   *    [TIME ZONE tz]
   *    [STYLE stl]
   *    [USING { {NO EDIT MASK}|{EDIT MASK mask} }]
   *    [ DD/MM/YY   | MM/DD/YY
   *    | DD/MM/YYYY | MM/DD/YYYY
   *    | DDMMYY     | MMDDYY
   *    | YYMMDD ] ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPWRITE_TO_OPTIONS.html
   */
  __format_option: $ =>
    choice(
      $.format_left_justified,
      $.format_centered,
      $.format_right_justified,
      $.format_exponent,
      $.format_no_grouping,
      $.format_no_sign,
      $.format_no_zero,
      $.format_currency,
      $.format_decimals,
      $.format_round,
      $.format_unit,
      $.format_environment_time_format,
      $.format_time_zone,
      $.format_style,
      $.format_using_no_edit_mask,
      $.format_using_edit_mask,
      $.format_date,
    ),

  format_left_justified: _ => gen.kw("left-justified"),

  format_centered: _ => gen.kw("centered"),

  format_right_justified: _ => gen.kw("right-justified"),

  format_exponent: $ =>
    seq(gen.kw("exponent"), field("value", $.general_expression)),

  format_no_grouping: _ => gen.kw("no-grouping"),

  format_no_sign: _ => gen.kw("no-sign"),

  format_no_zero: _ => gen.kw("no-zero"),

  format_currency: $ =>
    seq(gen.kw("currency"), field("value", $.general_expression)),

  format_decimals: $ =>
    seq(gen.kw("decimals"), field("value", $.general_expression)),

  format_round: $ => seq(gen.kw("round"), field("value", $.general_expression)),

  format_unit: $ => seq(gen.kw("unit"), field("value", $.general_expression)),

  format_environment_time_format: _ =>
    seq(...gen.kws("environment", "time", "format")),

  format_time_zone: $ =>
    seq(...gen.kws("time", "zone"), field("value", $.general_expression)),

  format_style: $ => seq(gen.kw("style"), field("value", $.general_expression)),

  format_using_edit_mask: $ =>
    seq(
      ...gen.kws("using", "edit", "mask"),
      field("mask", $.general_expression),
    ),

  format_using_no_edit_mask: _ =>
    seq(...gen.kws("using", "no", "edit", "mask")),

  format_date: _ =>
    choice(
      gen.kw("dd/mm/yy"),
      gen.kw("mm/dd/yy"),
      gen.kw("dd/mm/yyyy"),
      gen.kw("mm/dd/yyyy"),
      gen.kw("ddmmyy"),
      gen.kw("mmddyy"),
      gen.kw("yymmdd"),
    ),
};
