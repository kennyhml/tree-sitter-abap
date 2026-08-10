module.exports = {
  /**
   * Specification of a group key / expression or a set of group key components.
   *
   *  ... key / ( key1 = dobj1 key2 = dobj2 ...
   *            [gs = GROUP SIZE] [gi = GROUP INDEX] ) ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPLOOP_AT_ITAB_GROUP_BY_KEY.html
   */
  group_key_components: $ => gen.parenthesized(repeat1($.group_key_component)),

  // ( key1 = dobj1 key2 = dobj2 [gs = GROUP SIZE] [gi = GROUP INDEX] )
  group_key_component: $ =>
    seq(
      field("field", $.identifier),
      "=",
      field("value", choice($.expression, $.group_index, $.group_size)),
    ),

  group_index: _ => seq(...gen.kws("group", "index")),

  group_size: _ => seq(...gen.kws("group", "size")),

  group_by_spec: $ =>
    prec(
      1,
      seq(
        ...gen.kws("group", "by"),
        choice(
          prec(1, field("key", $.expression)),
          $.group_key_components,
        ),
        repeat(
          choice(
            $.sort_order_spec,
            $.without_members,
            field("result", $.__group_by_result),
          ),
        ),
      ),
    ),

  without_members: $ => seq(...gen.kws("without", "members")),

  /**
   * ... USING KEY loop_key ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDELETE_ITAB_INDEX.html
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMODIFY_ITAB_INDEX.html
   */
  using_loop_key_spec: _ => seq(...gen.kws("using", "key", "loop_key")),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPLOOP_AT_ITAB_GROUP_BY_BINDING.html
  __group_by_result: $ =>
    choice($.into_spec, $.assigning_spec, $.reference_into_spec),

  /**
   * ... { itab INDEX idx [USING KEY keyname] }
   *   | { itab [USING KEY loop_key] } ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDELETE_ITAB_INDEX.html
   */
  _itab_index_spec: $ =>
    seq(
      field("subject", $._modifiable_target),
      optional(choice($.using_loop_key_spec, $.index_spec)),
    ),

  // ... ASSIGNING <fs> / field-symbol(<fs>) [CASTING] [ELSE UNASSIGN] ...
  assigning_spec: $ =>
    seq(
      gen.kw("assigning"),
      field("target", choice($.field_symbol, $.declaration_expression)),
      optional($.casting),
      optional($.else_unassign),
    ),

  casting: _ => gen.kw("casting"),

  reference_into_spec: $ =>
    seq(
      ...gen.kws("reference", "into"),
      field("work_area", $._result_target),
    ),

  /**
   * ... COMPARING {comp1 comp2 ...}|{ALL FIELDS}/{NO FIELDS}]
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDELETE_DUPLICATES.html
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREAD_TABLE_TRANSPORT_OPTIONS.html
   */
  comparing_spec: $ =>
    seq(
      gen.kw("comparing"),
      choice(
        $.all_fields,
        $.no_fields,
        $.component_list,
      ),
    ),

  component_list: $ => prec.right(repeat1($.itab_comp)),

  /**
   * ... TRANSPORTING { {comp1 comp2 ...}|{ALL FIELDS} } ...
   */
  _transporting_components_spec: $ =>
    seq(
      gen.kw("transporting"),
      choice($.all_fields, $.component_list),
    ),

  _transporting_no_fields_spec: $ =>
    seq(gen.kw("transporting"), $.no_fields),

  _itab_mutation_result: $ => choice($.assigning_spec, $.reference_into_spec),
};
