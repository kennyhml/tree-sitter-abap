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
  class_declaration: $ => seq($.__class_declaration_prefix, "."),

  __class_declaration_prefix: $ =>
    seq(
      gen.kw("class"),
      field("name", $.identifier),
      gen.kw("definition"),
      optional($.class_options),
      ".",
      optional($.class_body),
      gen.kw("endclass"),
    ),

  /**
   * CLASS class DEFINITION DEFERRED [PUBLIC].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS_DEFERRED.html
   */
  deferred_class_declaration: $ =>
    seq($.__deferred_class_declaration_prefix, "."),

  __deferred_class_declaration_prefix: $ =>
    seq(
      gen.kw("class"),
      field("name", $.identifier),
      ...gen.kws("definition", "deferred"),
      optional($.for_testing),
    ),

  class_body: $ =>
    repeat1(choice($.public_section, $.protected_section, $.private_section)),

  public_section: $ =>
    seq(...gen.kws("public", "section"), ".", repeat($._class_component)),

  protected_section: $ =>
    seq(...gen.kws("protected", "section"), ".", repeat($._class_component)),

  private_section: $ =>
    seq(...gen.kws("private", "section"), ".", repeat($._class_component)),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS_IMPLEMENTATION.html
  class_implementation: $ => seq($.__class_implementation_prefix, "."),

  __class_implementation_prefix: $ =>
    seq(
      gen.kw("class"),
      field("name", $.identifier),
      gen.kw("implementation"),
      ".",
      repeat($.method_implementation),
      gen.kw("endclass"),
    ),

  /**
   * CLASS class DEFINITION
   *  LOCAL FRIENDS class1 class2 ...
   *                intf1 intf2 ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS_LOCAL_FRIENDS.html
   */
  local_friends_declaration: $ =>
    seq($.__local_friends_declaration_prefix, "."),

  __local_friends_declaration_prefix: $ =>
    seq(
      gen.kw("class"),
      field("name", $.identifier),
      ...gen.kws("definition", "local", "friends"),
      repeat1($.identifier),
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
   * [FOR EVENTS OF]
   * [[GLOBAL] FRIENDS class1 class2 ... intf1 intf2 ...].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS_OPTIONS.html
   */
  __class_option: $ =>
    choice(
      $.public,
      $.abstract,
      $.final,
      $.shared_memory_enabled,
      $.for_behavior_of_spec,
      $.for_events_of_spec,
      $.friends_spec,
      $.global_friends_spec,
      $.create_visibility_spec,
      $.inheriting_from_spec,
      alias($.__class_for_testing_spec, $.for_testing),
    ),

  inheriting_from_spec: $ =>
    seq(...gen.kws("inheriting", "from"), field("name", $.identifier)),

  create_visibility_spec: $ =>
    seq(gen.kw("create"), field("visibility", $.__visibility)),

  __visibility: _ => choice(...gen.kws("public", "protected", "private")),

  friends_spec: $ => seq(gen.kw("friends"), repeat1($.identifier)),

  global_friends_spec: $ =>
    seq(...gen.kws("global", "friends"), repeat1($.identifier)),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS_FOR_BEHAVIOR_OF.html
  for_behavior_of_spec: $ =>
    seq(...gen.kws("for", "behavior", "of"), field("entity", $.identifier)),

  // https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENCLASS_FOR_EVENTS.html
  for_events_of_spec: $ =>
    seq(...gen.kws("for", "events", "of"), field("entity", $.identifier)),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS_FOR_TESTING.html
  __class_for_testing_spec: $ =>
    seq(
      ...gen.kws("for", "testing"),
      repeat(choice($.duration_spec, $.risk_level_spec)),
    ),

  shared_memory_enabled: _ => seq(...gen.kws("shared", "memory", "enabled")),

  risk_level_spec: $ =>
    seq(...gen.kws("risk", "level"), field("level", $.__test_risk_level)),

  duration_spec: $ =>
    seq(gen.kw("duration"), field("duration", $.__test_duration)),

  __test_risk_level: _ =>
    choice(...gen.kws("critical", "dangerous", "harmless")),
  __test_duration: _ => choice(...gen.kws("short", "medium", "long")),
};
