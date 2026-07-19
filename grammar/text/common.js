module.exports = {
  textpool_language_spec: $ =>
    seq(gen.kw("language"), field("language", $.named_data_object)),
};
