module.exports = {
  /*
   * READ ENTITY [IN LOCAL MODE [WITH CHANGES]|[FORWARDING] PRIVILEGED]
   *      entity operations [response_param].
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPREAD_ENTITY_SHORT.html
   */
  read_entity_statement: $ => seq($.__read_entity_statement_prefix, "."),

  /*
   * READ ENTITIES OF bdef [IN LOCAL MODE|[FORWARDING] PRIVILEGED]
   *      ENTITY entity1 operations
   *      [ENTITY entity2 operations]
   *      [WITH CHANGES]
   *      [response_param].
   *
   * READ ENTITIES [IN LOCAL MODE|[FORWARDING] PRIVILEGED]
   *      OPERATIONS op_tab [response_param].
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPREAD_ENTITIES_LONG.html
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPREAD_ENTITIES_OPERATIONS.html
   */
  read_entities_statement: $ => seq($.__read_entities_statement_prefix, "."),

  __read_entity_statement_prefix: $ =>
    seq(
      ...gen.kws("read", "entity"),
      repeat(choice($.in_local_mode, $.with_changes, $.privileged)),
      field("entity", $.business_object),
      field("operations", optional($.read_entity_operations)),
      optional($.response_parameters),
    ),

  __read_entities_statement_prefix: $ =>
    seq(
      ...gen.kws("read", "entities"),
      choice(
        // static form
        seq(
          gen.kw("of"),
          field("business_object", $.business_object),
          repeat(choice($.in_local_mode, $.privileged)),
          repeat($.read_entity_spec),
          optional($.with_changes),
          optional($.response_parameters),
        ),
        // dynamic form
        seq(
          repeat(choice($.in_local_mode, $.privileged)),
          $.operations_spec,
          optional($.response_parameters),
        ),
      ),
    ),

  // ... ENTITY entity1 operations ...
  read_entity_spec: $ =>
    seq(
      gen.kw("entity"),
      field("entity", $.business_object),
      field("operations", optional($.read_entity_operations)),
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

  all_fields: _ => seq(...gen.kws("all", "fields")),
};
