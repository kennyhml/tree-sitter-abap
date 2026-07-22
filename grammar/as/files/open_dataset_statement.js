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
      field("file", $.data_object),
      // all the additions can seemingly just be intermixed.
      repeat(
        choice(
          $._dataset_access_kind,
          $.in_dataset_mode_spec,
          $._dataset_addition,
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
    seq(...gen.kws("delete", "dataset"), field("dataset", $.data_object)),

  /**
   * CLOSE DATASET dset.
   *
   * @see http://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLOSE_DATASET.html
   */
  close_dataset_statement: $ => seq($.__close_dataset_statement_prefix, "."),

  __close_dataset_statement_prefix: $ =>
    seq(...gen.kws("close", "dataset"), field("dataset", $.data_object)),

  // ... FOR INPUP / OUTPUT / APPENDING / UPDATE ..
  _dataset_access_kind: $ =>
    choice($.for_input, $.for_output, $.for_appending, $.for_update),

  for_input: _ => seq(...gen.kws("for", "input")),
  for_output: _ => seq(...gen.kws("for", "output")),
  for_appending: _ => seq(...gen.kws("for", "appending")),
  for_update: _ => seq(...gen.kws("for", "update")),

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
          $.dataset_text_mode_spec,
          $.dataset_legacy_binary_mode,
          $.dataset_legacy_text_mode,
        ),
      ),
    ),

  // BINARY MODE
  binary_mode: _ => seq(...gen.kws("binary", "mode")),

  // TEXT MODE encoding [linefeed]
  dataset_text_mode_spec: $ =>
    seq(
      ...gen.kws("text", "mode"),
      $.dataset_encoding_spec,
      optional($.dataset_linefeed_spec),
    ),

  // LEGACY BINARY MODE [endian] [CODE PAGE cp]
  dataset_legacy_binary_mode: $ =>
    seq(
      ...gen.kws("legacy", "binary", "mode"),
      optional($.dataset_endian_spec),
      optional($.dataset_code_page_spec),
    ),

  // LEGACY TEXT MODE [endian] [CODE PAGE cp] [linefeed]
  dataset_legacy_text_mode: $ =>
    seq(
      ...gen.kws("legacy", "text", "mode"),
      optional($.dataset_endian_spec),
      optional($.dataset_code_page_spec),
      optional($.dataset_linefeed_spec),
    ),

  /**
   * ... ENCODING { DEFAULT
   *            | {UTF-8 [SKIPPING|WITH BYTE-ORDER MARK]}
   *            | NON-UNICODE } ...
   */
  dataset_encoding_spec: $ =>
    prec.right(
      seq(
        gen.kw("encoding"),
        choice(
          $.default,
          $.non_unicode,
          seq(
            $.utf8,
            optional(
              choice($.skipping_byte_order_mark, $.with_byte_order_mark),
            ),
          ),
        ),
      ),
    ),

  skipping_byte_order_mark: _ =>
    seq(...gen.kws("skipping", "byte-order", "mark")),

  with_byte_order_mark: _ => seq(...gen.kws("with", "byte-order", "mark")),

  dataset_linefeed_spec: _ =>
    seq(
      gen.kw("with"),
      field("kind", choice(...gen.kws("native", "smart", "unix", "windows"))),
      gen.kw("linefeed"),
    ),

  dataset_endian_spec: _ =>
    seq(field("kind", choice(...gen.kws("big", "little"))), gen.kw("endian")),

  dataset_code_page_spec: $ =>
    seq(...gen.kws("code", "page"), field("code_page", $.data_object)),

  _dataset_addition: $ =>
    choice(
      $.dataset_position_spec,
      $.dataset_type_spec,
      $.dataset_filter_spec,
      $.dataset_message_spec,
      $.ignoring_conversion_errors,
      $.dataset_replacement_character_spec,
    ),

  // ... AT POSITION pos ...
  dataset_position_spec: $ =>
    seq(...gen.kws("at", "position"), field("position", $.data_object)),

  dataset_type_spec: $ =>
    seq(gen.kw("type"), field("attributes", $.data_object)),

  dataset_filter_spec: $ =>
    seq(gen.kw("filter"), field("command", $.data_object)),

  dataset_message_spec: $ =>
    seq(gen.kw("message"), field("destination", $.receiving_expression)),

  ignoring_conversion_errors: _ =>
    seq(...gen.kws("ignoring", "conversion", "errors")),

  dataset_replacement_character_spec: $ =>
    seq(
      ...gen.kws("replacement", "character"),
      field("character", $.data_object),
    ),

  non_unicode: _ => gen.kw("non-unicode"),

  default: _ => gen.kw("default"),

  utf8: _ => gen.kw("utf-8"),
};
