module.exports = {
  /**
   * FIELD-SYMBOLS <fs> { typing | obsolete_typing }.
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPFIELD-SYMBOLS.html
   */
  ...gen.declaration_and_spec("field-symbols", $ => $.field_symbol),

  field_symbol: $ =>
    seq("<", field("name", $._immediate_identifier), token.immediate(">")),

  _immediate_field_symbol: $ =>
    alias($.__immediate_field_symbol, $.field_symbol),

  __immediate_field_symbol: $ =>
    seq(
      token.immediate("<"),
      field("name", $._immediate_identifier),
      token.immediate(">"),
    ),
};
