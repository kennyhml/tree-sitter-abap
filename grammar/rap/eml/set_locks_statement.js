module.exports = {
  // @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPSET_LOCKS.html
  set_locks_statement: $ =>
    seq(
      choice(
        $.__set_locks_short_form_prefix,
        $.__set_locks_long_form_prefix,
        $.__set_locks_dynamic_form_prefix,
      ),
      ".",
    ),

  /*
   * SET LOCKS ENTITY entity FROM inst [response_param].
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPSET_LOCKS_ENTITY.html
   */
  __set_locks_short_form_prefix: $ =>
    seq(
      ...gen.kws("set", "locks"),
      $.lock_entity,
      optional($.response_parameters),
    ),

  /*
   * SET LOCKS OF bdef
   *    ENTITY entity1 FROM inst1
   *    [ENTITY entity2 FROM inst2]
   *    [...]
   *    [response_param].
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPSET_LOCKS_OF.html
   */
  __set_locks_long_form_prefix: $ =>
    seq(
      ...gen.kws("set", "locks", "of"),
      field("business_object", $.business_object),
      repeat1($.lock_entity),
      optional($.response_parameters),
    ),

  /*
   * SET LOCKS lock_tab [response_param].
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPSET_LOCKS_DYN.html
   */
  __set_locks_dynamic_form_prefix: $ =>
    seq(
      ...gen.kws("set", "locks"),
      field("lock_table", $.expression),
      optional($.response_parameters),
    ),

  // ... ENTITY entity FROM inst ...
  lock_entity: $ =>
    seq(
      gen.kw("entity"),
      field("entity", $.business_object),
      $.from_instance_table_spec,
    ),

  from_instance_table_spec: $ =>
    seq(gen.kw("from"), field("value", $.expression)),
};
