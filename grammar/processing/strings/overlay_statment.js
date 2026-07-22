module.exports = {
  /**
   * OVERLAY text1 WITH text2 [ONLY mask].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPOVERLAY.html
   */
  overlay_statement: $ => seq($.__overlay_statement_prefix, "."),

  __overlay_statement_prefix: $ =>
    seq(
      gen.kw("overlay"),
      field("subject", $.character_like_expression),
      gen.kw("with"),
      field("overlay", $.character_like_expression),
      optional($.only),
    ),

  only: $ => seq(gen.kw("only"), field("mask", $.character_like_expression)),
};
