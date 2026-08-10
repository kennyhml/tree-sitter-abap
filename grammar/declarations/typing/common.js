module.exports = {
  _ref_to_type: $ =>
    seq(
      ...gen.kws("ref", "to"),
      field(
        "subject",
        choice($.identifier, $.component_selection, $.dynamic_spec),
      ),
    ),

  _ref_to_data: $ =>
    seq(
      ...gen.kws("ref", "to"),
      field("object", choice($.identifier, $.component_selection)),
    ),

  initial_value_spec: _ => seq(...gen.kws("value", "is", "initial")),

  default_data_value_spec: $ =>
    seq(gen.kw("value"), field("val", $._simple_operand)),

  with_header_line: _ => seq(...gen.kws("with", "header", "line")),

  initial_size_spec: $ =>
    seq(...gen.kws("initial", "size"), field("size", $.number)),
};
