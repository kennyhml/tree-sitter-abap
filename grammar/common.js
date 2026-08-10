module.exports = {
  output: _ => gen.kw("output"),

  _writable_into_spec: $ =>
    seq(gen.kw("into"), field("result", $._write_target)),

  _operand_binding: $ =>
    seq(field("name", $.identifier), "=", field("value", $._simple_operand)),
};
