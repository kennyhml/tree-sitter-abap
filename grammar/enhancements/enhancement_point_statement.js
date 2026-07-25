module.exports = {
  /**
   * ENHANCEMENT-POINT enh_id SPOTS spot1 spot2 ...
   *                   [STATIC]
   *                   [INCLUDE BOUND].
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPENHANCEMENT-POINT.html
   */
  enhancement_point_statement: $ =>
    seq($.__enhancement_point_statement_prefix, "."),

  __enhancement_point_statement_prefix: $ =>
    seq(
      ...gen.kws("enhancement-point"),
      field("name", $.identifier),
      $.spots_spec,
      optional($.static),
      optional($.include_bound),
    ),
};
