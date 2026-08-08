module.exports = {
  // @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPGET_PERMISSIONS.html
  get_permissions_statement: $ =>
    seq(
      choice(
        $.__get_permissions_short_form_prefix,
        $.__get_permissions_long_form_prefix,
        $.__get_permissions_dynamic_form_prefix,
      ),
      ".",
    ),

  /*
   * GET PERMISSIONS [[FORWARDING] PRIVILEGED] [only_clause]
   *      ENTITY entity [FROM keys] REQUEST request RESULT result [response_param].
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPGET_PERMISSIONS_SHORT.html
   */
  __get_permissions_short_form_prefix: $ =>
    seq(
      ...gen.kws("get", "permissions"),
      optional($.privileged),
      optional($.permissions_scope_spec),
      $.get_entity_permissions,
      optional($.response_parameters),
    ),

  /*
   * GET PERMISSIONS [[FORWARDING] PRIVILEGED] [only_clause] OF bdef
   *      ENTITY entity1 [FROM keys] REQUEST request RESULT result
   *      [ENTITY entity2 ...] [response_param].
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPGET_PERMISSIONS_LONG.html
   */
  __get_permissions_long_form_prefix: $ =>
    seq(
      ...gen.kws("get", "permissions"),
      optional($.privileged),
      optional($.permissions_scope_spec),
      gen.kw("of"),
      field("business_object", $.business_object),
      repeat1($.get_entity_permissions),
      optional($.response_parameters),
    ),

  /*
   * GET PERMISSIONS [[FORWARDING] PRIVILEGED] [only_clause] OPERATIONS perm_tab [response_param]
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPGET_PERMISSIONS_DYN.html
   */
  __get_permissions_dynamic_form_prefix: $ =>
    seq(
      ...gen.kws("get", "permissions"),
      optional($.privileged),
      optional($.permissions_scope_spec),
      $.operations_table_spec,
      optional($.response_parameters),
    ),

  //  ... ENTITY entity [FROM keys] REQUEST request RESULT result [response_param] ...
  get_entity_permissions: $ =>
    seq(
      gen.kw("entity"),
      field("entity", $.business_object),
      optional($.from_keys_spec),
      $.request_spec,
      $.result_spec,
    ),

  // ... FROM keys ...
  from_keys_spec: $ =>
    seq(gen.kw("from"), field("value", $.general_expression)),

  /*
   * ... ONLY { GLOBAL
   *          | GLOBAL FEATURES
   *          | GLOBAL AUTHORIZATION
   *          | INSTANCE
   *          | INSTANCE FEATURES
   *          | INSTANCE AUTHORIZATION
   *          | FEATURES
   *          | AUTHORIZATION
   *          | (dyn_spec) } ...
   *
   */
  permissions_scope_spec: $ =>
    seq(
      gen.kw("only"),
      choice(
        $.global,
        $.global_features,
        $.global_authorization,
        $.instance,
        $.features,
        $.authorization,
        $.dynamic_spec,
      ),
    ),

  global: _ => gen.kw("global"),

  instance: _ => gen.kw("instance"),
};
