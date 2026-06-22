module.exports = {

  /**
   * Specification of a type by referring to another, existing type
   * 
   * DATA var { {TYPE [LINE OF] type} 
   *          / {LIKE [LINE OF] dobj} } 
   *          [VALUE val|{IS INITIAL}]
   *          [READ-ONLY].
   *
   * The naming for this is a little difficult considering its likely the
   * most frequent typing kind. An alternative would be `type_reference`,
   * which imo sounds too similar to `reference_type`. The term 'referring'
   * in this context comes from the ABAP spec itself and is not to be
   * confused with the term `referencing`.
   * 
   * As for all other type positons where a data object or type
   * name can be specified, they are tagged `object` and `name` respectively.
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
   * If we nest this into the referred type, while semantically correct,
   * it causes another level of depth that is difficult for the queries
   * to account for as the root must be the typing context.
   */
  type_line_of: $ => prec.right(seq(
    choice(
      $.__type_line_of,
      $.__like_line_of
    ),
    repeat($.__referred_type_addition)
  )),

  __referred_type_addition: $ => choice(
    $.default_data_value,
    $.initial_value,
    $.read_only,
  ),

  __referred_type_type_spec: $ => seq(
    gen.kw("type"),
    field("name", choice(
      $.identifier,
      $.component_selection
    ))
  ),

  __referred_type_like_spec: $ => seq(
    gen.kw("like"),
    field("object", choice(
      $.identifier,
      $.component_selection
    ))
  ),

  __type_line_of: $ => seq(
    gen.kw("type"),
    ...gen.kws("line", "of"),
    field("name", choice(
      $.identifier,
      $.component_selection
    ))
  ),

  // {LIKE [LINE OF] dobj}
  __like_line_of: $ => seq(
    gen.kw("like"),
    ...gen.kws("line", "of"),
    field("object", choice(
      $.identifier,
      $.component_selection
    ))
  )
}
