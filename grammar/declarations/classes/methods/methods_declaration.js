module.exports = {
  methods_declaration: ($) =>
    gen.chainable("methods", choice($.method_spec, $.constructor_spec)),

  class_methods_declaration: ($) =>
    gen.chainable(
      "class-methods",
      choice($.method_spec, $.class_constructor_spec),
    ),

  /**
   *
   * METHODS meth [ABSTRACT|FINAL]
   *              |[DEFAULT IGNORE|FAIL]
   *  [IMPORTING parameters [PREFERRED PARAMETER p]]
   *  [EXPORTING parameters]
   *  [CHANGING  parameters]
   *  [{RAISING exc1|RESUMABLE(exc1) exc2|RESUMABLE(exc2) ...}
   *               |{EXCEPTIONS exc1 exc2 ...}].
   *
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHODS_GENERAL.html
   */
  method_spec: ($) =>
    seq(field("name", $.identifier), optional($.__method_signature)),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHODS_CONSTRUCTOR.html
  constructor_spec: ($) =>
    seq(gen.kw("constructor"), optional($.__method_signature)),

  class_constructor_spec: ($) =>
    seq(gen.kw("class_constructor"), optional($.__method_signature)),

  __method_signature: ($) =>
    repeat1(
      choice(
        $.abstract,
        $.final,
        $.redefinition,
        $.for_testing,
        $.default_fail,
        $.default_ignore,
        $.for_table_function,
        $.for_scalar_function,
        $.for_event,
        $.for_sql_service,
        $.amdp_options,

        // Parameter lists
        gen.kw_tagged("importing", $.parameters),
        gen.kw_tagged("exporting", $.parameters),
        gen.kw_tagged("changing", $.parameters),
        gen.kw_tagged("raising", $.raising_list),
        gen.kw_tagged("exceptions", $.exceptions),
        gen.kw_tagged("returning", alias($.parameter, $.return_value)),
      ),
    ),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHODS_REDEFINITION.html
  redefinition: (_) => gen.kw("redefinition"),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHODS_EVENT_HANDLER.html
  for_event: ($) =>
    seq(
      ...gen.kws("for", "event"),
      field("name", $.identifier),
      gen.kw("of"),
      field("source", $.identifier),
    ),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHODS_DEFAULT.html
  default_ignore: (_) => seq(...gen.kws("default", "ignore")),

  default_fail: (_) => seq(...gen.kws("default", "fail")),
};
