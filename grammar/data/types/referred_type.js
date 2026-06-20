

module.exports = {

  /**
   * Specification of a type by referring to another type (declared elsewhere or in DDIC)
   * 
   * DATA var { {TYPE [LINE OF] type} 
   *          / {LIKE [LINE OF] dobj} } 
   *          [VALUE val|{IS INITIAL}]
   *          [READ-ONLY].
   * 
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDATA_REFERRING.html
   */
  referred_type: $ => prec.right(seq(
    choice(
      $.__referred_type_type_spec,
      $.__referred_type_like_spec
    ),
    repeat($.__referred_type_addition)
  )),

  /**
   * Easier to query and more meaningful than nesting
   */
  line_type: $ => prec.right(seq(
    choice(
      $.__type_line_of,
      $.__like_line_of
    ),
    repeat($.__referred_type_addition)
  )),

  __referred_type_addition: $ => choice(
    $.default_data_value,
    $.read_only,
  ),

  // {TYPE [LINE OF] type}
  __referred_type_type_spec: $ => seq(
    gen.kw("type"),
    field("name", choice(
      $.identifier,
      $.selector_expression
    ))
  ),

  // {LIKE [LINE OF] dobj}
  __referred_type_like_spec: $ => seq(
    gen.kw("like"),
    field("name", choice(
      $.identifier,
      $.selector_expression
    ))
  ),

  __type_line_of: $ => seq(
    gen.kw("type"),
    ...gen.kws("line", "of"),
    field("subject", choice(
      $.identifier,
      $.selector_expression
    ))
  ),

  // {LIKE [LINE OF] dobj}
  __like_line_of: $ => seq(
    gen.kw("like"),
    ...gen.kws("line", "of"),
    field("object", choice(
      $.identifier,
      $.selector_expression
    ))
  )
}
