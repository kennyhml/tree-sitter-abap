module.exports = {
  /**
   * TRANSLATE text {TO {UPPER|LOWER} CASE}
   *              / {USING mask}.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPTRANSLATE.html
   */
  translate_statement: $ =>
    seq(
      gen.kw("translate"),
      field("subject", $.character_like_expression),
      choice($.to_lower_case, $.to_upper_case, $.translation_mask),
      ".",
    ),

  to_upper_case: _ => seq(...gen.kws("to", "upper", "case")),

  to_lower_case: _ => seq(...gen.kws("to", "lower", "case")),

  translation_mask: $ =>
    seq(gen.kw("using"), field("mask", $.character_like_expression)),
};
