module.exports = {
  unpack_statement: $ => seq($.__unpack_statement_prefix, "."),

  __unpack_statement_prefix: $ =>
    seq(
      gen.kw("unpack"),
      field("source", $.general_expression),
      gen.kw("to"),
      field("destination", $.general_expression),
    ),
};
