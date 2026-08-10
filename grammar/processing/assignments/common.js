module.exports = {
  exact: _ => prec.left(gen.kw("exact")),

  type_handle_spec: $ =>
    seq(...gen.kws("type", "handle"), field("handle", $._reference_operand)),
};
