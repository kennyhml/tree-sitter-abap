module.exports = {
  /**
   * OVERLAY text1 WITH text2 [ONLY mask].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPOVERLAY.html
   */
  ...gen.periodTerminated("overlay_statement", $ =>
    seq(
      gen.kw("overlay"),
      field("subject", $.character_like_expression),
      gen.kw("with"),
      field("overlay", $.character_like_expression),
      optional($.only),
    ),
  ),

  only: $ => seq(gen.kw("only"), field("mask", $.character_like_expression)),
};
