module.exports = {
  _rap_method_signature: $ =>
    prec(
      1,
      seq(
        optional($.final),
        $.rap_handler_for_spec,
        repeat($.__rap_handler_parameter),
        optional(gen.kw_tagged("changing", $.parameters)),
      ),
    ),

  /**
   * FOR { DETERMINE ON { SAVE | MODIFY }
   *     | ENTITY EVENT
   *     | VALIDATE ON SAVE
   *     | LOCK
   *     | NUMBERING
   *     | PRECHECK
   *     | MODIFY
   *     | READ
   *     | GLOBAL AUTHORIZATION
   *     | GLOBAL FEATURES
   *     | [INSTANCE] AUTHORIZATION
   *     | [INSTANCE] FEATURES }
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPMETHODS_FOR_RAP_BEHV.html
   */
  rap_handler_for_spec: $ =>
    seq(
      gen.kw("for"),
      choice(
        $.determine_on,
        $.entity_event,
        $.lock,
        $.validate_on_save,
        $.numbering,
        $.read,
        $.precheck,
        $.modify,
        $.global_authorization,
        $.authorization,
        $.global_features,
        $.features,
      ),
    ),

  __rap_handler_parameter: $ =>
    choice(
      $.derived_importing_parameter,
      $.request_parameter_spec,
      $.result_parameter_spec,
    ),

  /**
   * [IMPORTING] { REFERENCE(param) | param }
   * [FOR handler-specific operation target]
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPMETHODS_FOR_RAP_BEHV.html
   */
  derived_importing_parameter: $ =>
    seq(
      optional(gen.kw("importing")),
      choice($.implicit_reference, $.explicit_reference),
      optional(
        choice(
          $.for_determination_spec,
          $.for_lock_spec,
          $.for_read_spec,
          $.for_function_spec,
          // These are defined in declarations/common cause
          // derived type declarations use them in the same form.
          $.for_action_spec,
          $.for_create_spec,
          $.for_update_spec,
          $.for_delete_spec,
        ),
      ),
    ),

  /**
   * DETERMINE ON { SAVE | MODIFY }
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPHANDLER_METH_DET.html
   */
  determine_on: $ =>
    seq(...gen.kws("determine", "on"), field("kind", choice($.save, $.modify))),

  /**
   * ENTITY EVENT
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENMETHOD_FOR_ENTITY_EVENT.html
   */
  entity_event: _ => seq(...gen.kws("entity", "event")),

  /**
   * LOCK
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPHANDLER_METH_LOCK.html
   */
  lock: _ => gen.kw("lock"),

  /**
   * VALIDATE ON SAVE
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPHANDLER_METH_VALIDATE.html
   */
  validate_on_save: _ => seq(...gen.kws("validate", "on", "save")),

  /**
   * PRECHECK
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPHANDLER_METH_PRECHECK.html
   */
  precheck: _ => gen.kw("precheck"),

  /**
   * NUMBERING
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPHANDLER_METH_NUMBERING.html
   */
  numbering: _ => gen.kw("numbering"),

  /**
   * READ
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPHANDLER_METH_READ.html
   */
  read: _ => gen.kw("read"),

  /**
   * GLOBAL AUTHORIZATION
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPHANDLER_METH_GLOBAL_AUTH.html
   */
  global_authorization: _ => seq(...gen.kws("global", "authorization")),

  /**
   * GLOBAL FEATURES
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPHANDLER_METH_GLOBAL_FEATURES.html
   */
  global_features: _ => seq(...gen.kws("global", "features")),

  /**
   * [INSTANCE] AUTHORIZATION
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPHANDLER_METH_AUTH.html
   */
  authorization: _ =>
    seq(optional(gen.kw("instance")), gen.kw("authorization")),

  /**
   * [INSTANCE] FEATURES
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPHANDLER_METH_FEATURES.html
   */
  features: _ => seq(optional(gen.kw("instance")), gen.kw("features")),

  /**
   * [IMPORTING] REQUEST { REFERENCE(req) | req } FOR bdef
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPHANDLER_METH_GLOBAL_AUTH.html
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPHANDLER_METH_AUTH.html
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPHANDLER_METH_GLOBAL_FEATURES.html
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPHANDLER_METH_FEATURES.html
   */
  request_parameter_spec: $ =>
    seq(
      optional(gen.kw("importing")),
      gen.kw("request"),
      choice($.implicit_reference, $.explicit_reference),
      gen.kw("for"),
      field("target", $.business_object),
    ),

  /**
   * RESULT { REFERENCE(res) | res }
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPMETHODS_FOR_RAP_BEHV.html
   */
  result_parameter_spec: $ =>
    seq(gen.kw("result"), choice($.implicit_reference, $.explicit_reference)),

  /**
   * FOR bdef~det
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPHANDLER_METH_DET.html
   */
  for_determination_spec: $ => seq(gen.kw("for"), $.business_object),

  /**
   * FOR LOCK bdef
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPHANDLER_METH_LOCK.html
   */
  for_lock_spec: $ => seq(...gen.kws("for", "lock"), $.business_object),

  /**
   * FOR READ bdef RESULT result
   * FOR READ bdef\_assoc FULL full RESULT result LINK link
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPHANDLER_METH_READ.html
   */
  for_read_spec: $ =>
    seq(
      ...gen.kws("for", "read"),
      field("target", $.business_object),
      choice(
        $.result_parameter_spec,
        seq(
          $.full_parameter_spec,
          $.result_parameter_spec,
          $.link_parameter_spec,
        ),
      ),
    ),

  full_parameter_spec: $ =>
    seq(gen.kw("full"), choice($.implicit_reference, $.explicit_reference)),

  link_parameter_spec: $ =>
    seq(gen.kw("link"), choice($.implicit_reference, $.explicit_reference)),

  /**
   * FOR FUNCTION bdef~function [REQUEST req] RESULT result
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPHANDLER_METH_READ.html
   */
  for_function_spec: $ =>
    prec.right(
      seq(
        ...gen.kws("for", "function"),
        field("target", $.business_object),
        optional(
          alias($.__operation_request_parameter_spec, $.request_parameter_spec),
        ),
        $.result_parameter_spec,
      ),
    ),

  /**
   * FOR ACTION bdef~action [REQUEST req] [RESULT res]
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPHANDLER_METH_MODIFY.html
   */
  for_action_spec: $ =>
    prec.right(
      seq(
        ...gen.kws("for", "action"),
        field("target", $.business_object),
        optional(
          alias($.__operation_request_parameter_spec, $.request_parameter_spec),
        ),
        optional($.result_parameter_spec),
      ),
    ),

  __operation_request_parameter_spec: $ =>
    seq(gen.kw("request"), choice($.implicit_reference, $.explicit_reference)),

  save: _ => gen.kw("save"),

  modify: _ => gen.kw("modify"),
};
