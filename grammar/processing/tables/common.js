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
      field("value", choice($.general_expression, $.group_index, $.group_size)),
    ),

  group_index: _ => seq(...gen.kws("group", "index")),

  group_size: _ => seq(...gen.kws("group", "size")),

  group_by: $ =>
    prec(
      1,
      seq(
        ...gen.kws("group", "by"),
        choice(
          prec(1, field("key", $.general_expression)),
          $.group_key_components,
        ),
        repeat(
          choice(
            $.sort_order,
            $.without_members,
            field("result", $._group_by_result),
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
  using_loop_key: _ => seq(...gen.kws("using", "key", "loop_key")),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPLOOP_AT_ITAB_GROUP_BY_BINDING.html
  _group_by_result: $ => choice($.into, $.assigning, $.reference_into),

  /**
   * ... { itab INDEX idx [USING KEY keyname] }
   *   | { itab [USING KEY loop_key] } ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDELETE_ITAB_INDEX.html
   */
  _itab_index_spec: $ =>
    seq(
      field("subject", $.general_expression),
      optional(choice($.using_loop_key, $.index)),
    ),
};
