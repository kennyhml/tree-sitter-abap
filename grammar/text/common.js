module.exports = {
  language_spec: $ =>
    seq(gen.kw("language"), field("language", $._reference_operand)),
};
