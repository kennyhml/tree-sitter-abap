module.exports = {

  ...gen.declaration_and_spec("class-data", $ => $.identifier),

  /**
   * CLASS class DEFINITION [class_options].
   *   [PUBLIC SECTION.
   *     [components]]
   *   [PROTECTED SECTION.
   *     [components]]
   *   [PRIVATE SECTION.
   *     [components]]
   * ENDCLASS.
   * 
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS.html
   */
  class_declaration: $ => seq(
    gen.kw("class"),
    field("name", $.identifier),
    gen.kw("definition"),
    optional($.class_options),
    ".",
    optional($.class_body),
    gen.kw("endclass"), "."
  ),

  /**
   * CLASS class DEFINITION DEFERRED [PUBLIC].
   * 
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS_DEFERRED.html
   */
  deferred_class_declaration: $ => seq(
    gen.kw("class"),
    field("name", $.identifier),
    ...gen.kws("definition", "deferred"),
    "."
  ),

  class_body: $ => repeat1(
    choice(
      $.public_section,
      $.protected_section,
      $.private_section,
    )
  ),

  _class_component: $ => choice(
    $.data_declaration,
    $.class_data_declaration,
    $.constants_declaration,
    $.types_declaration,
    $.aliases_declaration,
    $.interfaces_declaration,
    $.methods_declaration,
    $.class_methods_declaration,
    $._empty_statement,
  ),

  public_section: $ => seq(
    ...gen.kws("public", "section"), ".",
    repeat($._class_component)
  ),

  protected_section: $ => seq(
    ...gen.kws("protected", "section"), ".",
    repeat($._class_component)
  ),

  private_section: $ => seq(
    ...gen.kws("private", "section"), ".",
    repeat($._class_component)
  ),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS_IMPLEMENTATION.html
  class_implementation: $ => seq(
    gen.kw("class"), field("name", $.identifier), gen.kw("implementation"), ".",
    repeat($.method_implementation),
    gen.kw("endclass"), "."
  ),

  /**
   * CLASS class DEFINITION
   *  LOCAL FRIENDS class1 class2 ...
   *                intf1 intf2 ...
   * 
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS_LOCAL_FRIENDS.html
   */
  local_friends_declaration: $ => seq(
    gen.kw("class"),
    field("name", $.identifier),
    ...gen.kws("definition", "local", "friends"),
    repeat1($.identifier),
    "."
  ),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS_OPTIONS.html
  class_options: $ => repeat1($.__class_option),

  /**
   * [PUBLIC]
   * [INHERITING FROM superclass]
   * [ABSTRACT]
   * [FINAL]
   * [CREATE {PUBLIC|PROTECTED|PRIVATE}]
   * [SHARED MEMORY ENABLED]
   * [FOR TESTING]
   * [FOR BEHAVIOR OF]
   * [[GLOBAL] FRIENDS class1 class2 ... intf1 intf2 ...].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS_OPTIONS.html
   */
  __class_option: $ => choice(
    $.public,
    $.abstract,
    $.final,
    $.shared_memory_enabled,
    $.for_behavior_of,
    $.friends,
    $.global_friends,
    $.create_visibility,
    $.inheriting_from,
    alias($.__for_testing_spec, $.for_testing),
  ),

  inheriting_from: $ => seq(
    ...gen.kws("inheriting", "from"),
    field("name", $.identifier)
  ),

  create_visibility: $ => seq(
    gen.kw("create"),
    field("visibility", $._visibility)
  ),

  friends: $ => seq(
    gen.kw("friends"),
    repeat1($.identifier)
  ),

  global_friends: $ => seq(
    ...gen.kws("global", "friends"),
    repeat1($.identifier)
  ),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS_FOR_BEHAVIOR_OF.html
  for_behavior_of: $ => seq(
    ...gen.kws("for", "behavior", "of"),
    field("name", $.identifier)
  ),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS_FOR_TESTING.html
  __for_testing_spec: $ => seq(
    $.for_testing,
    repeat(choice($.duration, $.risk_level))
  ),

  shared_memory_enabled: _ => seq(
    ...gen.kws("shared", "memory", "enabled")
  ),

  risk_level: $ => seq(
    ...gen.kws("risk", "level"),
    field("level", $.__test_risk_level),
  ),

  duration: $ => seq(
    gen.kw("duration"),
    field("duration", $.__test_duration),
  ),

  __test_risk_level: _ => choice(...gen.kws("critical", "dangerous", "harmless")),
  __test_duration: _ => choice(...gen.kws("short", "medium", "long")),

}
