module.exports = {
  /**
   * Technically an obsolete language element - still commonly used.
   *
   * ADD dobj1 TO dobj2.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPADD.html
   */
  add_statement: $ => seq($.__add_statement_prefix, "."),

  __add_statement_prefix: $ =>
    seq(
      gen.kw("add"),
      field("value", $._simple_operand),
      gen.kw("to"),
      field("subject", $._modifiable_target),
    ),
};
