module.exports = {
  /*
   * READ ENTITY [IN LOCAL MODE [WITH CHANGES]|[FORWARDING] PRIVILEGED]
   *      entity operations [response_param].
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPREAD_ENTITY_SHORT.html
   */
  read_entity_statement: $ => seq($.__read_entity_statement_prefix, "."),

  __read_entity_statement_prefix: $ =>
    seq(
      ...gen.kws("read", "entity"),
      repeat(choice($.in_local_mode, $.with_changes, $.privileged)),
      field("entity", $.business_object),
      field("operations", optional($.read_entity_operations)),
      optional($.response_parameters),
    ),

  /*
   *... [field_spec RESULT result_tab]
   *    [BY \_assoc field_spec { { RESULT result_tab } | {LINK link_tab} }
   *                           | { RESULT result_tab LINK link_tab} ]
   *    [EXECUTE function field_spec [REQUEST request] RESULT result_tab ] ...
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPREAD_ENTITY_ENTITIES_OP.html
   */
  read_entity_operations: $ =>
    repeat1(choice($.read_entity, $.read_by_association, $.execute_function)),

  /*
   * ... { FROM fields_tab }
   *   | { FIELDS ( comp1 comp2 ... ) WITH fields_tab }
   *   | { ALL FIELDS WITH fields_tab } ...
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPREAD_ENTITY_ENTITIES_FIELDS.html
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENEML_READ_OP_FIELDS_ABEXA.html
   */
  _read_fields_spec: $ =>
    seq(
      choice(
        $.from_fields_table_spec,
        seq($.fields_spec, $.with_fields_table_spec),
        seq($.all_fields, $.with_fields_table_spec),
      ),
    ),

  // field_spec RESULT result_tab
  read_entity: $ => seq($._read_fields_spec, $.result_table_spec),

  /*
   *  [BY \_assoc field_spec { { RESULT result_tab } | {LINK link_tab} }
   *                          | { RESULT result_tab LINK link_tab} ]
   */
  read_by_association: $ =>
    seq(
      gen.kw("by"),
      $.association_navigation,
      $._read_fields_spec,
      choice(
        $.result_table_spec,
        $.link_table_spec,
        seq($.result_table_spec, $.link_table_spec),
      ),
    ),

  // [EXECUTE function field_spec [REQUEST request] RESULT result_tab ] ...
  execute_function: $ =>
    seq(
      gen.kw("execute"),
      field("name", $.identifier),
      $._read_fields_spec,
      optional($.request_spec),
      $.result_table_spec,
    ),

  // For selective functions. may appear in other contexts later?
  request_spec: $ =>
    seq(gen.kw("request"), field("value", $.general_expression)),

  from_fields_table_spec: $ =>
    seq(gen.kw("from"), field("value", $.general_expression)),

  with_fields_table_spec: $ =>
    seq(gen.kw("with"), field("value", $.general_expression)),

  all_fields: _ => seq(...gen.kws("all", "fields")),
};
