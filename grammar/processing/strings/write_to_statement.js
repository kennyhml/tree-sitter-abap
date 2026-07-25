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
      $.left_justified,
      $.centered,
      $.right_justified,
      $.format_exponent_spec,
      $.no_grouping,
      $.no_sign,
      $.no_zero,
      $.format_currency_spec,
      $.format_decimals_spec,
      $.format_round_spec,
      $.format_unit_spec,
      $.environment_time_format,
      $.time_zone_spec,
      $.format_style_spec,
      $.format_using_no_edit_mask_spec,
      $.format_using_edit_mask_spec,
      $.format_date_spec,
    ),

  left_justified: _ => gen.kw("left-justified"),

  centered: _ => gen.kw("centered"),

  right_justified: _ => gen.kw("right-justified"),

  format_exponent_spec: $ =>
    seq(gen.kw("exponent"), field("value", $.general_expression)),

  no_grouping: _ => gen.kw("no-grouping"),

  no_sign: _ => gen.kw("no-sign"),

  no_zero: _ => gen.kw("no-zero"),

  format_currency_spec: $ =>
    seq(gen.kw("currency"), field("value", $.general_expression)),

  format_decimals_spec: $ =>
    seq(gen.kw("decimals"), field("value", $.general_expression)),

  format_round_spec: $ =>
    seq(gen.kw("round"), field("value", $.general_expression)),

  format_unit_spec: $ =>
    seq(gen.kw("unit"), field("value", $.general_expression)),

  environment_time_format: _ =>
    seq(...gen.kws("environment", "time", "format")),

  format_style_spec: $ =>
    seq(gen.kw("style"), field("value", $.general_expression)),

  format_using_edit_mask_spec: $ =>
    seq(
      ...gen.kws("using", "edit", "mask"),
      field("mask", $.general_expression),
    ),

  format_using_no_edit_mask_spec: _ =>
    seq(...gen.kws("using", "no", "edit", "mask")),

  format_date_spec: _ =>
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
