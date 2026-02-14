import { kw, kws } from '../helpers/keywords.js'
import { declaration_and_spec } from '../helpers/decl_gen.js'

export default {

    class_statement: $ => choice(
        $.class_definition,
        $.deferred_class_definition,
        $.local_friends_spec,
        $.class_implementation,
        $.class_data_declaration
    ),

    ...declaration_and_spec("class-data", $ => $.identifier),

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
     * @see {@link https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS.html}
     */
    class_definition: $ => seq(
        kw("class"), field("name", $.identifier), kw("definition"),
        optional($.class_options), ".",
        optional($.class_body),
        kw("endclass"), "."
    ),

    class_body: $ => repeat1(
        choice(
            $.public_section,
            $.protected_section,
            $.private_section,
        )
    ),

    public_section: $ => seq(
        ...kws("public", "section"), ".",
        repeat($._class_component)
    ),

    protected_section: $ => seq(
        ...kws("protected", "section"), ".",
        repeat($._class_component)
    ),

    private_section: $ => seq(
        ...kws("private", "section"), ".",
        repeat($._class_component)
    ),

    /**
     * CLASS class DEFINITION DEFERRED [PUBLIC].
     * 
     * @see {@link https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS_DEFERRED.html }
     */
    deferred_class_definition: $ => seq(
        kw("class"),
        field("name", $.identifier),
        ...kws("definition", "deferred"),
        "."
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS_IMPLEMENTATION.html
    class_implementation: $ => seq(
        kw("class"), field("name", $.identifier), kw("implementation"), ".",
        repeat($.method_implementation),
        kw("endclass"), "."
    ),

    /**
     * CLASS class DEFINITION
     *  LOCAL FRIENDS class1 class2 ...
     *                intf1 intf2 ...
     * 
     * @see {@link https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS_LOCAL_FRIENDS.html}
     */
    local_friends_spec: $ => seq(
        kw("class"),
        field("name", $.identifier),
        ...kws("definition", "local", "friends"),
        field("friend", repeat1($.identifier)),
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
     * @see {@link https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS_OPTIONS.html}
     */
    __class_option: $ => choice(
        $.public_spec,
        $.abstract_spec,
        $.final_spec,
        $.shared_memory_enabled_spec,
        $.for_rap_behavior_spec,
        field("friends", $.friends_spec),
        field("accessibility", $.create_visibility_spec),
        field("superclass", $.superclass_spec),
        field("testing", alias($.__for_testing_spec, $.for_testing_spec)),
    ),

    superclass_spec: $ => seq(
        ...kws("inheriting", "from"),
        field("name", $.identifier)
    ),

    create_visibility_spec: $ => seq(
        kw("create"),
        field("visibility", $._visibility)
    ),

    friends_spec: $ => seq(
        optional(kw("global")),
        kw("friends"),
        repeat1($.identifier)
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS_FOR_BEHAVIOR_OF.html
    for_rap_behavior_spec: $ => seq(
        ...kws("for", "behavior", "of"),
        field("bdef", $.identifier)
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS_FOR_TESTING.html
    __for_testing_spec: $ => seq(
        $.for_testing_spec,
        repeat(choice($.testing_duration_spec, $.testing_risk_level_spec))
    ),

    shared_memory_enabled_spec: _ => seq(
        ...kws("shared", "memory", "enabled")
    ),

    testing_risk_level_spec: $ => seq(
        ...kws("risk", "level"),
        field("level", $.__test_risk_level),
    ),

    testing_duration_spec: $ => seq(
        kw("duration"),
        field("duration", $.__test_duration),
    ),

    __test_risk_level: _ => choice(...kws("critical", "dangerous", "harmless")),
    __test_duration: _ => choice(...kws("short", "medium", "long")),

}