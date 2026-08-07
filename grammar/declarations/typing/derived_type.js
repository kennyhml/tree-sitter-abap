module.exports = {
  /*
   * RAP derived types
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/abenrpm_derived_types.html
   */
  _derived_type: $ =>
    choice(
      $.derived_table_type,
      $.derived_structure_type,
      $.derived_request_type,
      $.derived_response_type,
    ),

  // ... FOR CHANGE bdef ...
  derive_for_change_spec: $ =>
    seq(
      ...gen.kws("for", "change"),
      field("business_object", $.business_object),
    ),

  // ... FOR READ CHANGES bdef ...
  derive_for_read_changes_spec: $ =>
    seq(
      ...gen.kws("for", "read", "changes"),
      field("business_object", $.business_object),
    ),

  // ... FOR READ IMPORT bdef [\_assoc] ...
  derive_for_read_import_spec: $ =>
    seq(
      ...gen.kws("for", "read", "import"),
      field("business_object", $.business_object),
    ),

  // ... FOR READ LINK bdef\_assoc ...
  derive_for_read_link_spec: $ =>
    seq(
      ...gen.kws("for", "read", "link"),
      field("business_object", $.association_navigation),
    ),

  // ... FOR READ RESULT bdef [\_assoc] ...
  derive_for_read_result_spec: $ =>
    seq(
      ...gen.kws("for", "read", "result"),
      field("business_object", $.business_object),
    ),

  derive_for_action_import_spec: $ =>
    seq(
      ...gen.kws("for", "action", "import"),
      field("target", $.business_object),
    ),

  derive_for_action_request_spec: $ =>
    seq(
      ...gen.kws("for", "action", "request"),
      field("target", $.business_object),
    ),

  derive_for_action_result_spec: $ =>
    seq(
      ...gen.kws("for", "action", "result"),
      field("target", $.business_object),
    ),

  derive_for_authorization_key_spec: $ =>
    seq(
      gen.kw("for"),
      optional(gen.kw("instance")),
      ...gen.kws("authorization", "key"),
      field("target", $.business_object),
    ),

  derive_for_authorization_request_spec: $ =>
    seq(
      gen.kw("for"),
      optional(gen.kw("instance")),
      ...gen.kws("authorization", "request"),
      field("target", $.business_object),
    ),

  derive_for_authorization_result_spec: $ =>
    seq(
      gen.kw("for"),
      optional(gen.kw("instance")),
      ...gen.kws("authorization", "result"),
      field("target", $.business_object),
    ),

  derive_for_global_authorization_request_spec: $ =>
    seq(
      ...gen.kws("for", "global", "authorization", "request"),
      field("target", $.business_object),
    ),

  derive_for_global_authorization_result_spec: $ =>
    seq(
      ...gen.kws("for", "global", "authorization", "result"),
      field("target", $.business_object),
    ),

  derive_for_determination_spec: $ =>
    seq(...gen.kws("for", "determination"), field("target", $.business_object)),

  derive_for_event_spec: $ =>
    seq(...gen.kws("for", "event"), field("target", $.business_object)),

  derive_for_failed_spec: $ =>
    seq(
      ...gen.kws("for", "failed"),
      optional(field("time", choice($.early, $.late))),
      field("business_object", $.business_object),
    ),

  derive_for_mapped_spec: $ =>
    seq(
      ...gen.kws("for", "mapped"),
      optional(field("time", choice($.early, $.late))),
      field("business_object", $.business_object),
    ),

  derive_for_reported_spec: $ =>
    seq(
      ...gen.kws("for", "reported"),
      optional(field("time", choice($.early, $.late))),
      field("business_object", $.business_object),
    ),

  derive_for_hierarchy_spec: $ =>
    seq(
      ...gen.kws("for", "hierarchy"),
      field("business_object", $.business_object),
    ),

  derive_for_features_key_spec: $ =>
    seq(
      gen.kw("for"),
      optional(gen.kw("instance")),
      ...gen.kws("features", "key"),
      field("target", $.business_object),
    ),

  derive_for_features_request_spec: $ =>
    seq(
      gen.kw("for"),
      optional(gen.kw("instance")),
      ...gen.kws("features", "request"),
      field("target", $.business_object),
    ),

  derive_for_features_result_spec: $ =>
    seq(
      gen.kw("for"),
      optional(gen.kw("instance")),
      ...gen.kws("features", "result"),
      field("target", $.business_object),
    ),

  derive_for_global_features_request_spec: $ =>
    seq(
      ...gen.kws("for", "global", "features", "request"),
      field("target", $.business_object),
    ),

  derive_for_global_features_result_spec: $ =>
    seq(
      ...gen.kws("for", "global", "features", "result"),
      field("target", $.business_object),
    ),

  derive_for_function_request_spec: $ =>
    seq(
      ...gen.kws("for", "function", "request"),
      field("target", $.business_object),
    ),

  derive_for_function_import_spec: $ =>
    seq(
      ...gen.kws("for", "function", "import"),
      field("target", $.business_object),
    ),

  derive_for_function_result_spec: $ =>
    seq(
      ...gen.kws("for", "function", "result"),
      field("target", $.business_object),
    ),

  derive_for_key_of_spec: $ =>
    seq(
      ...gen.kws("for", "key", "of"),
      field("business_object", $.business_object),
    ),

  derive_for_permissions_key_spec: $ =>
    seq(
      ...gen.kws("for", "permissions", "key"),
      field("business_object", $.business_object),
    ),

  derive_for_permissions_request_spec: $ =>
    seq(
      ...gen.kws("for", "permissions", "request"),
      field("business_object", $.business_object),
    ),

  derive_for_permissions_result_spec: $ =>
    seq(
      ...gen.kws("for", "permissions", "result"),
      field("business_object", $.business_object),
    ),

  derive_for_validation_spec: $ =>
    seq(...gen.kws("for", "validation"), field("target", $.business_object)),

  late: _ => gen.kw("late"),

  early: _ => gen.kw("early"),

  /*
   *... TABLE FOR { ACTION IMPORT bdef~action }
   *        | { ACTION RESULT bdef~action }
   *        | { [INSTANCE] AUTHORIZATION KEY bdef[~group] }
   *        | { [INSTANCE] AUTHORIZATION RESULT bdef[~group] }
   *        | { CHANGE bdef }
   *        | { CREATE bdef [\_assoc] }
   *        | { DELETE bdef }
   *        | { DETERMINATION bdef~det }
   *        | { EVENT bdef~evt }
   *        | { FAILED [EARLY | LATE] bdef }
   *        | { HIERARCHY bdef }
   *        | { [INSTANCE] FEATURES KEY bdef[~group] }
   *        | { [INSTANCE] FEATURES RESULT bdef[~group] }
   *        | { FUNCTION IMPORT bdef~function }
   *        | { FUNCTION RESULT bdef~function }
   *        | { KEY OF bdef }
   *        | { MAPPED [EARLY | LATE] bdef }
   *        | { PERMISSIONS KEY bdef }
   *        | { READ CHANGES bdef }
   *        | { READ IMPORT bdef [\_assoc] }
   *        | { READ LINK bdef\_assoc }
   *        | { READ RESULT bdef [\_assoc] }
   *        | { REPORTED [EARLY | LATE] bdef }
   *        | { UPDATE bdef }
   *        | { VALIDATION bdef~valid } ...
   */
  derived_table_type: $ =>
    seq(
      ...gen.kws("type", "table"),
      choice(
        $.derive_for_action_import_spec,
        $.derive_for_action_result_spec,
        $.derive_for_authorization_key_spec,
        $.derive_for_authorization_result_spec,
        $.derive_for_change_spec,
        $.for_create_spec,
        $.for_delete_spec,
        $.derive_for_determination_spec,
        $.derive_for_event_spec,
        $.derive_for_failed_spec,
        $.derive_for_hierarchy_spec,
        $.derive_for_features_key_spec,
        $.derive_for_features_result_spec,
        $.derive_for_function_import_spec,
        $.derive_for_function_result_spec,
        $.derive_for_key_of_spec,
        $.derive_for_mapped_spec,
        $.derive_for_permissions_key_spec,
        $.derive_for_read_changes_spec,
        $.derive_for_read_import_spec,
        $.derive_for_read_link_spec,
        $.derive_for_read_result_spec,
        $.derive_for_reported_spec,
        $.for_update_spec,
        $.derive_for_validation_spec,
      ),
    ),

  /*
   *... STRUCTURE FOR { ACTION IMPORT bdef~action }
   *            | { ACTION REQUEST bdef~action }
   *            | { ACTION RESULT bdef~action }
   *            | { [INSTANCE] AUTHORIZATION KEY bdef[~group] }
   *            | { [INSTANCE] AUTHORIZATION REQUEST bdef[~group] }
   *            | { [INSTANCE] AUTHORIZATION RESULT bdef[~group] }
   *            | { CHANGE bdef }
   *            | { CREATE bdef [\_assoc] }
   *            | { DELETE bdef }
   *            | { DETERMINATION bdef~det }
   *            | { EVENT bdef~evt }
   *            | { FAILED [EARLY | LATE] bdef }
   *            | { [INSTANCE] FEATURES KEY bdef[~group] }
   *            | { [INSTANCE] FEATURES REQUEST bdef[~group] }
   *            | { [INSTANCE] FEATURES RESULT bdef[~group] }
   *            | { FUNCTION IMPORT bdef~function }
   *            | { FUNCTION REQUEST bdef~function }
   *            | { FUNCTION RESULT bdef~function }
   *            | { GLOBAL AUTHORIZATION REQUEST bdef[~group] }
   *            | { GLOBAL AUTHORIZATION RESULT bdef[~group] }
   *            | { GLOBAL FEATURES REQUEST bdef[~group] }
   *            | { GLOBAL FEATURES RESULT bdef[~group] }
   *            | { HIERARCHY bdef }
   *            | { KEY OF bdef }
   *            | { MAPPED [EARLY | LATE] bdef }
   *            | { PERMISSIONS KEY bdef }
   *            | { PERMISSIONS REQUEST bdef }
   *            | { PERMISSIONS RESULT bdef }
   *            | { READ CHANGES bdef }
   *            | { READ IMPORT bdef [\_assoc] }
   *            | { READ LINK bdef\_assoc }
   *            | { READ RESULT bdef [\_assoc] }
   *            | { REPORTED [EARLY | LATE] bdef }
   *            | { UPDATE bdef }
   *            | { VALIDATION bdef~valid } ...
   */
  derived_structure_type: $ =>
    seq(
      ...gen.kws("type", "structure"),
      choice(
        $.derive_for_action_import_spec,
        $.derive_for_action_request_spec,
        $.derive_for_action_result_spec,
        $.derive_for_authorization_key_spec,
        $.derive_for_authorization_request_spec,
        $.derive_for_authorization_result_spec,
        $.derive_for_change_spec,
        $.for_create_spec,
        $.for_delete_spec,
        $.derive_for_determination_spec,
        $.derive_for_event_spec,
        $.derive_for_failed_spec,
        $.derive_for_hierarchy_spec,
        $.derive_for_features_key_spec,
        $.derive_for_features_request_spec,
        $.derive_for_features_result_spec,
        $.derive_for_function_import_spec,
        $.derive_for_function_request_spec,
        $.derive_for_function_result_spec,
        $.derive_for_global_authorization_request_spec,
        $.derive_for_global_authorization_result_spec,
        $.derive_for_global_features_request_spec,
        $.derive_for_global_features_result_spec,
        $.derive_for_key_of_spec,
        $.derive_for_mapped_spec,
        $.derive_for_permissions_key_spec,
        $.derive_for_permissions_request_spec,
        $.derive_for_permissions_result_spec,
        $.derive_for_read_changes_spec,
        $.derive_for_read_import_spec,
        $.derive_for_read_link_spec,
        $.derive_for_read_result_spec,
        $.derive_for_reported_spec,
        $.for_update_spec,
        $.derive_for_validation_spec,
      ),
    ),

  /*
   * ... REQUEST FOR { { CHANGE
   *            | DELETE }
   *              bdef } ...
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPTYPE_REQUEST_FOR.html
   */
  derived_request_type: $ =>
    seq(
      ...gen.kws("type", "request"),
      choice($.derive_for_change_spec, $.for_delete_spec),
    ),

  /*
   * ... RESPONSE FOR { FAILED
   *         | MAPPED
   *         | REPORTED
   *         { [EARLY | LATE] }
   *           bdef } ...
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPTYPE_RESPONSE_FOR.html
   */
  derived_response_type: $ =>
    seq(
      ...gen.kws("type", "response"),
      choice(
        $.derive_for_failed_spec,
        $.derive_for_mapped_spec,
        $.derive_for_reported_spec,
      ),
    ),
};
