module.exports = {
  report_maximum_width_spec: $ =>
    seq(
      ...gen.kws("maximum", "width", "into"),
      field("destination", $.writable_expression),
    ),

  program_directory_entry_spec: $ =>
    seq(...gen.kws("directory", "entry"), field("entry", $.named_data_object)),

  source_error_message_spec: $ =>
    seq(gen.kw("message"), field("destination", $.writable_expression)),

  source_error_include_spec: $ =>
    seq(gen.kw("include"), field("destination", $.writable_expression)),

  source_error_line_spec: $ =>
    seq(gen.kw("line"), field("destination", $.writable_expression)),

  source_error_word_spec: $ =>
    seq(gen.kw("word"), field("destination", $.writable_expression)),

  source_error_offset_spec: $ =>
    seq(gen.kw("offset"), field("destination", $.writable_expression)),

  source_error_message_id_spec: $ =>
    seq(gen.kw("message-id"), field("destination", $.writable_expression)),
};
