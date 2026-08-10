module.exports = {
  modif_id_spec: $ => seq(...gen.kws("modif", "id"), field("id", $.identifier)),

  default_value_spec: $ =>
    seq(gen.kw("default"), field("value", $._simple_operand)),

  visible_length_spec: $ =>
    seq(...gen.kws("visible", "length"), field("length", $.number)),

  memory_id_spec: $ =>
    seq(...gen.kws("memory", "id"), field("id", $.identifier)),

  search_help_spec: $ =>
    seq(...gen.kws("matchcode", "object"), field("name", $.identifier)),

  user_command_spec: $ =>
    seq(gen.kw("user-command"), field("command", $.identifier)),

  lower_case: _ => seq(...gen.kws("lower", "case")),

  obligatory_spec: _ => seq(gen.kw("obligatory"), optional(gen.kw("off"))),

  no_intervals_spec: _ =>
    seq(...gen.kws("no", "intervals"), optional(gen.kw("off"))),

  no_extension_spec: _ => seq(gen.kw("no-extension"), optional(gen.kw("off"))),

  no_display: _ => gen.kw("no-display"),
};
