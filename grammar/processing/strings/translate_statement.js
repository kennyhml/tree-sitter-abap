module.exports = {
  /**
   * TRANSLATE text {TO {UPPER|LOWER} CASE}
   *              / {USING mask}.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPTRANSLATE.html
   */
  translate_statement: $ => seq($.__translate_statement_prefix, "."),

  __translate_statement_prefix: $ =>
    seq(
      gen.kw("translate"),
      field("subject", $.character_like_expression),
      choice(
        $.to_lower_case_spec,
        $.to_upper_case_spec,
        $.translation_mask_spec,
      ),
    ),

  to_upper_case_spec: _ => seq(...gen.kws("to", "upper", "case")),

  to_lower_case_spec: _ => seq(...gen.kws("to", "lower", "case")),

  translation_mask_spec: $ =>
    seq(gen.kw("using"), field("mask", $.character_like_expression)),
};
