module.exports = {
  /*
   * LEAVE TO { {TRANSACTION ta} | {CURRENT TRANSACTION} }
   *          [AND SKIP FIRST SCREEN].
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPLEAVE_TO_TRANSACTION.html
   */
  leave_to_transaction_statement: $ =>
    seq($.__leave_to_transaction_prefix, "."),

  __leave_to_transaction_prefix: $ =>
    seq(
      ...gen.kws("leave", "to"),
      choice(
        seq(
          gen.kw("transaction"),
          field("transaction", $.character_like_expression),
        ),
        $.current_transaction,
      ),
      optional($.and_skip_first_screen),
    ),

  current_transaction: _ => seq(...gen.kws("current", "transaction")),

  leave_program_statement: $ => seq($.__leave_program_prefix, "."),

  __leave_program_prefix: _ => seq(...gen.kws("leave", "program")),
};
