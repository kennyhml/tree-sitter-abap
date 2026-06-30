module.exports = {
  /**
   * |[literal_text][embedded_expressions][control_characters]|
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENSTRING_TEMPLATES_EXPRESSIONS.html
   */
  string_template: ($) =>
    seq(
      // Must allow " and # directly after the pipe, otherwise the inline comment rule strikes..
      /[|](["#]*)/,
      repeat(
        choice(
          /(?:\\.|[^{}|])+/, // Allow {,  } and | when escaped
          $.embedded_expression,
        ),
      ),
      "|",
    ),

  /**
   * { embd_exp [format_options] }
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENGENERAL_EXPR_POSITION_GLOSRY.html
   */
  embedded_expression: ($) =>
    seq("{", $.general_expression, repeat($.format_option), "}"),

  /**
   * String template formatting arguments, e.g `ALPHA = IN`.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCOMPUTE_STRING_FORMAT_OPTIONS.html
   */
  format_option: ($) =>
    seq(
      field("name", $.identifier),
      "=",
      field("value", choice($.general_expression, $.dynamic_spec)),
    ),
};
