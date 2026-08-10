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
      field("subject", $._modifiable_target),
      gen.kw("with"),
      field("overlay", $._character_position),
      optional($.only_spec),
    ),

  only_spec: $ =>
    seq(gen.kw("only"), field("mask", $._character_position)),
};
