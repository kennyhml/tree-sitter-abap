module.exports = {
  describe_distance_statement: $ => seq($.__describe_distance_statement_prefix, "."),

  __describe_distance_statement_prefix: $ =>
    seq(
      ...gen.kws("describe", "distance", "between"),
      field("from", $.data_object),
      gen.kw("and"),
      field("to", $.data_object),
      gen.kw("into"),
      field("destination", $.writable_expression),
      $._processing_mode_spec,
    ),
};
