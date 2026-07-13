module.exports = {
  /**
   * RAISE SHORTDUMP { {TYPE cx_class [message] [EXPORTING p1 = a1 p2 = a2 ...]} | oref }.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPRAISE_SHORTDUMP.html
   */
  raise_shortdump_statement: $ =>
    seq(
      ...gen.kws("raise", "shortdump"),
      field("exception", choice($.general_expression, $.new_exception_spec)),
    ),
};
