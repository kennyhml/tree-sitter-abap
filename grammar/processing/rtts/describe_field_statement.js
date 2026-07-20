module.exports = {
  /**
   * DESCRIBE FIELD dobj
   *          [TYPE typ [COMPONENTS com]]
   *          [LENGTH ilen IN {BYTE|CHARACTER} MODE]
   *          [DECIMALS dec]
   *          [OUTPUT-LENGTH olen]
   *          [HELP-ID hlp]
   *          [EDIT MASK mask].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDESCRIBE_FIELD.html
   */
  ...gen.periodTerminated("describe_field_statement", $ =>
    seq(
      ...gen.kws("describe", "field"),
      // data objects (including literals) are possible
      field("subject", $.data_object),
      repeat($.__describe_field_addition),
    ),
  ),

  __describe_field_addition: $ =>
    choice(
      $.describe_type_spec,
      $.describe_length_spec,
      $.describe_decimals_spec,
      $.describe_output_length_spec,
      $.describe_help_id_spec,
      $.describe_edit_mask_spec,
    ),

  describe_type_spec: $ =>
    seq(
      gen.kw("type"),
      field("destination", $.writable_expression),
      optional(
        seq(gen.kw("components"), field("components", $.writable_expression)),
      ),
    ),

  describe_length_spec: $ =>
    seq(
      gen.kw("length"),
      field("destination", $.writable_expression),
      $._processing_mode_spec,
    ),

  describe_decimals_spec: $ =>
    seq(gen.kw("decimals"), field("destination", $.writable_expression)),

  describe_output_length_spec: $ =>
    seq(gen.kw("output-length"), field("destination", $.writable_expression)),

  describe_help_id_spec: $ =>
    seq(gen.kw("help-id"), field("destination", $.writable_expression)),

  describe_edit_mask_spec: $ =>
    seq(
      ...gen.kws("edit", "mask"),
      field("destination", $.writable_expression),
    ),
};
