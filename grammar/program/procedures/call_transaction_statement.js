module.exports = {
  call_transaction_statement: $ =>
    seq(
      choice(
        $.__call_transaction_simple_form_prefix,
        $.__call_transaction_batch_form_prefix,
      ),
      ".",
    ),

  /*
   * CALL TRANSACTION ta WITH|WITHOUT AUTHORITY-CHECK[AND SKIP FIRST SCREEN].
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPCALL_TRANSACTION_STANDARD.html
   */
  __call_transaction_simple_form_prefix: $ =>
    seq(
      ...gen.kws("call", "transaction"),
      field("transaction", $._character_position),
      choice($.with_authority_check, $.without_authority_check),
      optional($.and_skip_first_screen),
    ),

  /*
   * CALL TRANSACTION ta WITH|WITHOUT AUTHORITY-CHECK
   *                     USING bdc_tab { {[MODE mode] [UPDATE upd]}
   *                                   /  [OPTIONS FROM opt] }
   *                                      [MESSAGES INTO itab].
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPCALL_TRANSACTION_STANDARD.html
   */
  __call_transaction_batch_form_prefix: $ =>
    seq(
      ...gen.kws("call", "transaction"),
      field("transaction", $._character_position),
      choice($.with_authority_check, $.without_authority_check),
      $.using_batch_table_spec,
      optional(
        choice(
          seq(
            $.transaction_processing_mode_spec,
            optional($.transaction_update_mode_spec),
          ),
          $.transaction_update_mode_spec,
          $.transaction_options_from_spec,
        ),
      ),
      optional($.transaction_messages_into_spec),
    ),

  using_batch_table_spec: $ =>
    seq(gen.kw("using"), field("table", $.expression)),

  transaction_processing_mode_spec: $ =>
    seq(gen.kw("mode"), field("mode", $.expression)),

  transaction_update_mode_spec: $ =>
    seq(gen.kw("update"), field("mode", $.expression)),

  transaction_options_from_spec: $ =>
    seq(...gen.kws("options", "from"), field("options", $.expression)),

  transaction_messages_into_spec: $ =>
    seq(...gen.kws("messages", "into"), field("target", $._write_target)),

  with_authority_check: _ => seq(...gen.kws("with", "authority-check")),

  without_authority_check: _ =>
    seq(...gen.kws("without", "authority-check")),

  and_skip_first_screen: _ => seq(...gen.kws("and", "skip", "first", "screen")),
};
