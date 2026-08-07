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
   *     | LOCK
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
        $.lock,
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
   * [FOR { bdef~purpose | LOCK bdef }]
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPMETHODS_FOR_RAP_BEHV.html
   */
  derived_importing_parameter: $ =>
    prec.dynamic(
      1,
      seq(
        optional(gen.kw("importing")),
        choice($.implicit_reference, $.explicit_reference),
        optional(choice($.parameter_for_spec, $.parameter_for_lock_spec)),
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
   * LOCK
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPHANDLER_METH_LOCK.html
   */
  lock: _ => gen.kw("lock"),

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
  parameter_for_spec: $ => seq(gen.kw("for"), $.business_object),

  /**
   * FOR LOCK bdef
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPHANDLER_METH_LOCK.html
   */
  parameter_for_lock_spec: $ =>
    seq(...gen.kws("for", "lock"), $.business_object),

  save: _ => gen.kw("save"),

  modify: _ => gen.kw("modify"),
};
