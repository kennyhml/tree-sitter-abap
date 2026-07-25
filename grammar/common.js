module.exports = {
  output: _ => gen.kw("output"),

  _writable_into_spec: $ =>
    seq(gen.kw("into"), field("result", $.writable_expression)),

  _data_object_binding: $ =>
    seq(field("name", $.identifier), "=", field("value", $.data_object)),
};
