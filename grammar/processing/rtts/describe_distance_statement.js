module.exports = {
  describe_distance_statement: $ => seq($.__describe_distance_statement_prefix, "."),

  __describe_distance_statement_prefix: $ =>
    seq(
      ...gen.kws("describe", "distance", "between"),
      field("from", $._simple_operand),
      gen.kw("and"),
      field("to", $._simple_operand),
      gen.kw("into"),
      field("destination", $._write_target),
      $._processing_mode_spec,
    ),
};
