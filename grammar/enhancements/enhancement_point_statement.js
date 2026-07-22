module.exports = {
  enhancement_point_statement: $ =>
    seq($.__enhancement_point_statement_prefix, "."),

  __enhancement_point_statement_prefix: $ =>
    seq(
      ...gen.kws("enhancement-point"),
      field("name", $.identifier),
      $.enhancement_spots_spec,
      optional($.static),
      optional($.include_bound),
    ),

  enhancement_spots_spec: $ =>
    prec.right(seq(gen.kw("spots"), repeat1($.identifier))),

  static: _ => gen.kw("static"),

  include_bound: _ => seq(...gen.kws("include", "bound")),
};
