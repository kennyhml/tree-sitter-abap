module.exports = {
  /**
   * Raising of non class-based exceptions (sy-subrc).
   *
   * RAISE exception.
   *
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPRAISE_EXCEPTION.html
   */
  raise_statement: $ => seq(gen.kw("raise"), field("name", $.identifier)),

  /**
   * Raising of class-based exceptions.
   *
   * RAISE [RESUMABLE] EXCEPTION
   *   { {TYPE cx_class [message] [EXPORTING p1 = a1 p2 = a2 ...]}
   *     / oref }.
   *
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPRAISE_EXCEPTION_CLASS.html
   */
  raise_exception_statement: $ =>
    seq(
      gen.kw("raise"),
      optional($.resumable),
      gen.kw("exception"),
      field("exception", choice($.general_expression, $.new_exception_spec)),
    ),

  // {TYPE cx_class [message] [EXPORTING p1 = a1 p2 = a2 ...]
  new_exception_spec: $ =>
    prec.right(
      seq(
        gen.kw("type"),
        field("class_name", $.identifier),
        optional(choice($.using_message, $.inline_message)),
        optional($._exporting_args),
      ),
    ),

  // For some reason 'using message' went missing from the docs, but it
  // just uses the system message fields (sy-msgid, etc..)
  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPRAISE_EXCEPTION_MESSAGE.html
  using_message: _ => seq(...gen.kws("using", "message")),

  resumable: _ => gen.kw("resumable"),
};
