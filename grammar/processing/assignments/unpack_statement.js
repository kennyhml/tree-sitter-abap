module.exports = {
  unpack_statement: $ =>
    seq(
      gen.kw("unpack"),
      field("source", $.general_expression),
      gen.kw("to"),
      field("destination", $.general_expression),
      ".",
    ),
};
