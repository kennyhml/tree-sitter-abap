module.exports = {
  /**
   * Dynamic specification of an operand
   *
   * This basically accounts for most cases where identifiers can be
   * specified dynamically, such as struct-('foo'), struct-(1), dynamic
   * method calls, etc.
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENDYNAMIC_COMPONENT_ABEXA.html
   * @seeh ttps://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENOPERANDS_SPECIFYING.html
   */
  dynamic_spec: ($) =>
    gen.tightParens(
      field(
        "value",
        choice(
          $._immediate_identifier,
          $._immediate_field_symbol,
          $._immediate_string_literal,
          $._immediate_number,
        ),
      ),
    ),

  // Same rule but enforced immediately for e.g. dynamic component selection
  _immediate_dynamic_spec: ($) =>
    alias(
      gen.immediateTightParens(
        field(
          "value",
          choice(
            $._immediate_identifier,
            $._immediate_string_literal,
            $._immediate_field_symbol,
            $._immediate_number,
          ),
        ),
      ),
      $.dynamic_spec,
    ),
};
