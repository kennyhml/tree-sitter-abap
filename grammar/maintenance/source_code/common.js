module.exports = {
  maximum_width_spec: $ =>
    seq(
      ...gen.kws("maximum", "width", "into"),
      field("destination", $._write_target),
    ),

  directory_entry_spec: $ =>
    seq(...gen.kws("directory", "entry"), field("entry", $._modifiable_target)),

  source_error_message_spec: $ =>
    seq(gen.kw("message"), field("destination", $._write_target)),

  source_error_include_spec: $ =>
    seq(gen.kw("include"), field("destination", $._write_target)),

  source_error_line_spec: $ =>
    seq(gen.kw("line"), field("destination", $._write_target)),

  source_error_word_spec: $ =>
    seq(gen.kw("word"), field("destination", $._write_target)),

  source_error_offset_spec: $ =>
    seq(gen.kw("offset"), field("destination", $._write_target)),

  source_error_message_id_spec: $ =>
    seq(gen.kw("message-id"), field("destination", $._write_target)),
};
