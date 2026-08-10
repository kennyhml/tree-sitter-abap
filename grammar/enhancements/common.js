module.exports = {
  spots_spec: $ =>
    prec.right(
      seq(
        gen.kw("spots"),
        repeat1(choice($.identifier, $._contextual_identifier)),
      ),
    ),

  static: _ => gen.kw("static"),

  include_bound: _ => seq(...gen.kws("include", "bound")),
};
