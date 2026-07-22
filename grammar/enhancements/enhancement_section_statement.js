module.exports = {
  /**
   * ENHANCEMENT-SECTION enh_id SPOTS spot1 spot2 ...
   *                [STATIC]
   *                [INCLUDE BOUND].
   *  ...
   * END-ENHANCEMENT-SECTION.
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPENHANCEMENT-SECTION.html
   */
  enhancement_section_statement: $ =>
    seq($.__enhancement_section_statement_prefix, "."),

  __enhancement_section_statement_prefix: $ =>
    seq(
      gen.kw("enhancement-section"),
      field("name", $.identifier),
      $.enhancement_spots_spec,
      optional($.static),
      optional($.include_bound),
      ".",
      field("body", optional($.statement_block)),
      gen.kw("end-enhancement-section"),
    ),
};
