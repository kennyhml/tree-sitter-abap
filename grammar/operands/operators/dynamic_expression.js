module.exports = {

  /**
   * ABAP doesnt really have a word for this kind of operation.
   *
   * This basically accounts for most cases where identifiers can be
   * specified dynamically, such as struct-('foo'), struct-(1), dynamic
   * method calls, etc.
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENDYNAMIC_COMPONENT_ABEXA.html
   * which covers it for components but not various other positions they can be used in.
   */
  dynamic_expression: $ => gen.tightParens(
    field("value",
      choice(
        $._immediate_identifier,
        $._immediate_string_literal,
        $._immediate_number,
      ),
    ),
  ),

  _immediate_dynamic_expression: $ => alias(
    gen.immediateTightParens(
      field(
        "value",
        choice(
          $._immediate_identifier,
          $._immediate_string_literal,
          $._immediate_number,
        ),
      ),
    ),
    $.dynamic_expression,
  ),
};

