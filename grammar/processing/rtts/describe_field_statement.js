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
  describe_field_statement: $ => seq($.__describe_field_statement_prefix, "."),

  __describe_field_statement_prefix: $ =>
    seq(
      ...gen.kws("describe", "field"),
      // data objects (including literals) are possible
      field(
        "subject",
        choice($._contextual_identifier, $._simple_operand),
      ),
      repeat($.__describe_field_addition),
    ),

  __describe_field_addition: $ =>
    choice(
      $.describe_type_spec,
      $.describe_length_spec,
      $.describe_decimals_spec,
      $.output_length_spec,
      $.help_id_spec,
      $.edit_mask_spec,
    ),

  describe_type_spec: $ =>
    seq(
      gen.kw("type"),
      field("destination", $._write_target),
      optional(
        seq(gen.kw("components"), field("components", $._write_target)),
      ),
    ),

  describe_length_spec: $ =>
    seq(
      gen.kw("length"),
      field("destination", $._write_target),
      $._processing_mode_spec,
    ),

  describe_decimals_spec: $ =>
    seq(gen.kw("decimals"), field("destination", $._write_target)),

  output_length_spec: $ =>
    seq(gen.kw("output-length"), field("destination", $._write_target)),

  help_id_spec: $ =>
    seq(gen.kw("help-id"), field("destination", $._write_target)),

  edit_mask_spec: $ =>
    seq(
      ...gen.kws("edit", "mask"),
      field("destination", $._write_target),
    ),
};
