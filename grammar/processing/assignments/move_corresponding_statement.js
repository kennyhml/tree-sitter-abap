module.exports = {
  move_corresponding_statement: $ => seq($.__move_corresponding_statement_prefix, "."),

  __move_corresponding_statement_prefix: $ =>
    seq(
      gen.kw("move-corresponding"),
      optional($.exact),
      field("source", $.general_expression),
      gen.kw("to"),
      field("destination", $.general_expression),
      optional($.expanding_nested_tables),
      optional($.keeping_target_lines),
    ),

  expanding_nested_tables: _ =>
    seq(...gen.kws("expanding", "nested", "tables")),

  keeping_target_lines: _ =>
    seq(...gen.kws("keeping", "target", "lines")),
};
