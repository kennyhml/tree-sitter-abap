module.exports = {
  /*
   * MODIFY ENTITY [IN LOCAL MODE|[FORWARDING] PRIVILEGED]
   *     entity operations [response_param].
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPMODIFY_ENTITY_SHORT.html
   */
  modify_entity_statement: $ => seq($.__modify_entity_statement_prefix, "."),

  /*
   * MODIFY ENTITIES OF bdef [IN LOCAL MODE|[FORWARDING] PRIVILEGED]
   *        ENTITY entity1 operations
   *        [ENTITY entity2 operations]
   *        [response_param].
   *
   * MODIFY ENTITIES [IN LOCAL MODE|[FORWARDING] PRIVILEGED]
   *      OPERATIONS op_tab [response_param].
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPMODIFY_ENTITIES_LONG.html
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPMODIFY_ENTITIES_OPERATIONS_DYN.html
   */
  modify_entities_statement: $ =>
    seq($.__modify_entities_statement_prefix, "."),

  __modify_entity_statement_prefix: $ =>
    seq(
      ...gen.kws("modify", "entity"),
      optional($.in_local_mode),
      optional($.privileged),
      field("entity", $.business_object),
      field("operations", optional($.modify_entity_operations)),
      optional($.response_parameters),
    ),

  __modify_entities_statement_prefix: $ =>
    seq(
      ...gen.kws("modify", "entities"),
      choice(
        // static form
        seq(
          gen.kw("of"),
          field("business_object", $.business_object),
          repeat(choice($.in_local_mode, $.privileged)),
          repeat($.modify_entity_spec),
          optional($.response_parameters),
        ),
        // dynamic form
        seq(
          repeat(choice($.in_local_mode, $.privileged)),
          $.operations_table_spec,
          optional($.response_parameters),
        ),
      ),
    ),

  // ... ENTITY entity1 operations ...
  modify_entity_spec: $ =>
    seq(
      gen.kw("entity"),
      field("entity", $.business_object),
      field("operations", optional($.modify_entity_operations)),
    ),

  /*
   * ... [CREATE field_spec]
   *     [CREATE BY \_assoc field_spec]
   *     [UPDATE field_spec]
   *     [DELETE field_spec]
   *     [EXECUTE action field_spec [REQUEST request] [RESULT result_tab]] ...
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPMODIFY_ENTITY_ENTITIES_OP.html
   */
  modify_entity_operations: $ =>
    repeat1(
      choice(
        $.create_entity,
        $.create_by_association,
        $.update_entity,
        $.delete_entity,
        $.execute_action,
      ),
    ),

  // ... CREATE field_spec ...
  create_entity: $ => seq(gen.kw("create"), $._modify_fields_spec),

  // ... CREATE BY \_assoc field_spec ...
  create_by_association: $ =>
    seq(
      ...gen.kws("create", "by"),
      field("entity", $.association_navigation),
      $._modify_fields_spec,
    ),

  // ... UPDATE field_spec ...
  update_entity: $ => seq(gen.kw("update"), $._modify_fields_spec),

  // ... DELETE field_spec ...
  delete_entity: $ => seq(gen.kw("delete"), $._modify_fields_spec),

  // ... EXECUTE action field_spec [REQUEST request] [RESULT result_tab] ...
  execute_action: $ =>
    seq(
      gen.kw("execute"),
      field("name", $.identifier),
      $._modify_fields_spec,
      optional($.request_spec),
      optional($.result_table_spec),
    ),

  /*
   * ...  { FROM fields_tab }
   *    | { AUTO FILL CID WITH fields_tab }
   *    | { [AUTO FILL CID] FIELDS ( comp1 comp2 ... ) WITH fields_tab }
   *    | { [AUTO FILL CID] SET FIELDS WITH fields_tab } ...
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPMODIFY_ENTITY_ENTITIES_FIELDS.html
   */
  _modify_fields_spec: $ =>
    choice(
      $.from_fields_table_spec,
      seq($.auto_fill_cid, $.with_fields_table_spec),
      seq(optional($.auto_fill_cid), $.fields_spec, $.with_fields_table_spec),
      seq(optional($.auto_fill_cid), $.set_fields, $.with_fields_table_spec),
    ),

  auto_fill_cid: _ => seq(...gen.kws("auto", "fill", "cid")),

  set_fields: _ => seq(...gen.kws("set", "fields")),
};
