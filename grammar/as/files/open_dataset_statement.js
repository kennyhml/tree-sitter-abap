module.exports = {
  /**
   * OPEN DATASET dset FOR access IN mode
   *                   [position]
   *                   [os_additions]
   *                   [error_handling].
   *
   * This statement has an insane amount of additions..
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDATASET.html
   */
  open_dataset_statement: $ => seq($.__open_dataset_statement_prefix, "."),

  __open_dataset_statement_prefix: $ =>
    seq(
      ...gen.kws("open", "dataset"),
      field("file", $._simple_operand),
      // all the additions can seemingly just be intermixed.
      repeat(
        choice(
          $.dataset_access_spec,
          $.in_dataset_mode_spec,
          $.__dataset_addition,
        ),
      ),
    ),

  /**
   * DELETE DATASET dset.
   *
   * @see http://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDELETE_DATASET.html
   */
  delete_dataset_statement: $ => seq($.__delete_dataset_statement_prefix, "."),

  __delete_dataset_statement_prefix: $ =>
    seq(...gen.kws("delete", "dataset"), field("dataset", $._simple_operand)),

  /**
   * CLOSE DATASET dset.
   *
   * @see http://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLOSE_DATASET.html
   */
  close_dataset_statement: $ => seq($.__close_dataset_statement_prefix, "."),

  __close_dataset_statement_prefix: $ =>
    seq(...gen.kws("close", "dataset"), field("dataset", $._simple_operand)),

  // ... FOR INPUT / OUTPUT / APPENDING / UPDATE ...
  dataset_access_spec: $ =>
    seq(gen.kw("for"), choice($.input, $.output, $.appending, $.update)),

  update: _ => gen.kw("update"),

  /**
   * ... {BINARY MODE}
   *   | {TEXT MODE encoding [linefeed]}
   *   | {LEGACY BINARY MODE [endian][CODE PAGE cp]}
   *   | {LEGACY TEXT MODE [endian] [CODE PAGE cp] [linefeed]} ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPOPEN_DATASET_MODE.html
   */
  in_dataset_mode_spec: $ =>
    seq(
      gen.kw("in"),
      field(
        "mode",
        choice(
          $.binary_mode,
          $.text_mode,
          $.legacy_binary_mode,
          $.legacy_text_mode,
        ),
      ),
    ),

  // BINARY MODE
  binary_mode: _ => seq(...gen.kws("binary", "mode")),

  // TEXT MODE encoding [linefeed]
  text_mode: $ =>
    seq(
      ...gen.kws("text", "mode"),
      $.encoding_spec,
      optional($.linefeed_spec),
    ),

  // LEGACY BINARY MODE [endian] [CODE PAGE cp]
  legacy_binary_mode: $ =>
    seq(
      ...gen.kws("legacy", "binary", "mode"),
      optional($.endian_spec),
      optional($.code_page_spec),
    ),

  // LEGACY TEXT MODE [endian] [CODE PAGE cp] [linefeed]
  legacy_text_mode: $ =>
    seq(
      ...gen.kws("legacy", "text", "mode"),
      optional($.endian_spec),
      optional($.code_page_spec),
      optional($.linefeed_spec),
    ),

  /**
   * ... ENCODING { DEFAULT
   *            | {UTF-8 [SKIPPING|WITH BYTE-ORDER MARK]}
   *            | NON-UNICODE } ...
   */
  encoding_spec: $ =>
    prec.right(
      seq(
        gen.kw("encoding"),
        choice(
          $.default,
          $.non_unicode,
          seq(
            $.utf8,
            optional(
              choice(
                $.skipping_byte_order_mark,
                $.with_byte_order_mark,
              ),
            ),
          ),
        ),
      ),
    ),

  skipping_byte_order_mark: _ =>
    seq(...gen.kws("skipping", "byte-order", "mark")),

  with_byte_order_mark: _ =>
    seq(...gen.kws("with", "byte-order", "mark")),

  linefeed_spec: _ =>
    seq(
      gen.kw("with"),
      field("kind", choice(...gen.kws("native", "smart", "unix", "windows"))),
      gen.kw("linefeed"),
    ),

  endian_spec: _ =>
    seq(field("kind", choice(...gen.kws("big", "little"))), gen.kw("endian")),

  code_page_spec: $ =>
    seq(...gen.kws("code", "page"), field("code_page", $._simple_operand)),

  non_unicode: _ => gen.kw("non-unicode"),

  default: _ => gen.kw("default"),

  utf8: _ => gen.kw("utf-8"),

  __dataset_addition: $ =>
    choice(
      alias($.__open_at_position_spec, $.at_position_spec),
      $.dataset_type_spec,
      $.dataset_filter_spec,
      $.dataset_message_spec,
      $.ignoring_conversion_errors,
      $.replacement_character_spec,
    ),

  // ... AT POSITION pos ...
  __open_at_position_spec: $ =>
    seq(...gen.kws("at", "position"), field("position", $._simple_operand)),

  dataset_type_spec: $ =>
    seq(gen.kw("type"), field("attributes", $._simple_operand)),

  dataset_filter_spec: $ =>
    seq(gen.kw("filter"), field("command", $._simple_operand)),

  dataset_message_spec: $ =>
    seq(gen.kw("message"), field("destination", $._result_target)),

  ignoring_conversion_errors: _ =>
    seq(...gen.kws("ignoring", "conversion", "errors")),

  replacement_character_spec: $ =>
    seq(
      ...gen.kws("replacement", "character"),
      field("character", $._simple_operand),
    ),

};
