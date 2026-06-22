module.exports = {

  /**
   * Offset/Length Specifications for Substring Access
   *
   * Valid in any operand position
   *
   * dobj[+off][(len)]
   * <fs>[+off][(len)]
   * dref->*[+off][(len)]
   * 
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENOFFSET_LENGTH.html
   */
  substring_access: $ => prec.right(1, seq(
    // TODO: Unify this choice
    field("value", choice(
      $.identifier,
      $.component_selection,
      $.dereference_expression,
      $.field_symbol
    )),
    choice(
      seq(
        $.__substring_offset,
        optional($.__substring_length)
      ),
      $.__substring_length
    ),
  )),

  __substring_offset: $ => seq(
    token.immediate("+"),
    field("offset",
      choice(
        $._immediate_number,
        $._immediate_identifier
      )
    )
  ),

  __substring_length: $ => seq(
    token.immediate("("),
    field("length",
      choice(
        $._immediate_number,
        $._immediate_identifier
      )
    ),
    token.immediate(")"),
  ),

}
