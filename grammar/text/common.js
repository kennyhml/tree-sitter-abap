module.exports = {
  language_spec: $ =>
    seq(gen.kw("language"), field("language", $.named_data_object)),
};
