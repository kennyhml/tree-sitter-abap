module.exports = {
  _derived_type: $ => choice($.derived_table_type),

  business_object: $ =>
    choice(
      $.identifier, // root entity
      $.association_navigation,
      $.composition_navigation,
    ),

  bo_action: $ =>
    seq(
      field("entity", $.identifier),
      token.immediate("~"),
      field("name", $._immediate_identifier),
    ),

  association_navigation: $ =>
    seq(
      field(
        "source",
        choice(
          $.composition_navigation,
          $.association_navigation,
          $.identifier, // root
        ),
      ),
      token.immediate("\\"),
      field("association", $._immediate_identifier),
    ),

  composition_navigation: $ =>
    seq(
      field(
        "source",
        choice(
          $.composition_navigation,
          $.identifier, // root
        ),
      ),
      token.immediate("\\\\"),
      field("composition", $._immediate_identifier),
    ),

  derive_for_create_spec: $ =>
    seq(
      ...gen.kws("for", "create"),
      field("business_object", $.business_object),
    ),

  derive_for_action_import_spec: $ =>
    seq(...gen.kws("for", "action", "import"), $.bo_action),

  derive_for_action_result_spec: $ =>
    seq(...gen.kws("for", "action", "result"), $.bo_action),

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
        $.derive_for_create_spec,
        $.derive_for_action_result_spec,
        $.derive_for_action_import_spec,
      ),
    ),

  /*
   *... FOR { ACTION IMPORT bdef~action }
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
  _structure_derived_purpose: $ => choice(),

  /*
   * ... FOR { { CHANGE
   *            | DELETE }
   *              bdef } ...
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPTYPE_REQUEST_FOR.html
   */
  _request_derived_purpose: $ => choice(),

  /*
   * ... FOR { FAILED
   *         | MAPPED
   *         | REPORTED
   *         { [EARLY | LATE] }
   *           bdef } ...
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPTYPE_RESPONSE_FOR.html
   */
  _response_derived_purpose: $ => choice(),
};
