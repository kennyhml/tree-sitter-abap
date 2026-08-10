module.exports = {
  unpack_statement: $ => seq($.__unpack_statement_prefix, "."),

  __unpack_statement_prefix: $ =>
    seq(
      gen.kw("unpack"),
      field("source", $.expression),
      gen.kw("to"),
      field("destination", $._write_target),
    ),
};
