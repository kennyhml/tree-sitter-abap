const { kw, kws } = require('../helpers/keywords.js')
const { chainable } = require('../helpers/decl_gen.js')

module.exports = {

    methods_declaration: $ => chainable(
        "methods", choice($.method_spec, $.constructor_spec)
    ),

    class_methods_declaration: $ => chainable(
        "class-methods", choice($.method_spec, $.class_constructor_spec)
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
    method_spec: $ => seq(
        field("name", $.identifier),
        optional($.__method_signature)
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHOD.html
    method_implementation: $ => seq(
        kw("method"),
        field("name",
            choice(
                $.identifier,
                $.interface_component_selector
            )
        ),
        ".",
        optional($.method_body),
        kw("endmethod"),
        "."
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHODS_CONSTRUCTOR.html
    constructor_spec: $ => seq(
        kw("constructor"),
        optional($.__method_signature)
    ),

    class_constructor_spec: $ => seq(
        kw("class_constructor"),
        optional($.__method_signature)
    ),

    __method_signature: $ => repeat1(
        choice(
            $.abstract_spec,
            $.final_spec,
            $.redefinition_spec,
            $.for_testing_spec,
            $.interface_default_spec,
            $.for_table_function_spec,
            $.for_scalar_function_spec,
            field("event", $.for_event_spec),
            field("amdp", $.amdp_options_spec),

            // Parameter lists
            params("importing", $.parameter_list),
            params("exporting", $.parameter_list),
            params("changing", $.parameter_list),
            params("raising", $.raising_list),
            params("exceptions", $.exception_list),
            params("returning", alias($.parameter, $.return_value)),
        )
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHODS_REDEFINITION.html
    redefinition_spec: _ => kw("redefinition"),

    /**
     * AMDP OPTIONS [READ-ONLY] 
     *              [client_handling] ...
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHODS_AMDP_OPTIONS.html 
     */
    amdp_options_spec: $ => seq(
        ...kws("amdp", "options"),
        repeat1(choice(
            $.read_only_spec,
            field("client_handling", $.__amdp_client_handling_spec)
        ))
    ),

    /**
     * AMDP OPTIONS [CDS SESSION CLIENT CURRENT|clnt]
     * ...
     * {CDS SESSION CLIENT DEPENDENT} | {CLIENT INDEPENDENT}
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHODS_AMDP_OPTIONS_CLIENT.html
     */
    __amdp_client_handling_spec: $ => choice(
        $.cds_session_client_dependent_spec,
        $.client_independent_spec,
        $.cds_session_client_spec
    ),

    cds_session_client_spec: $ => seq(
        ...kws("cds", "session", "client"),
        field("client", choice(
            $.current_client,
            $.identifier,
        ))
    ),

    cds_session_client_dependent_spec: _ => seq(
        ...kws("cds", "session", "client", "dependent")
    ),

    client_independent_spec: _ => seq(
        ...kws("client", "independent")
    ),

    current_client: _ => kw("current"),

    /**
     * FOR TABLE FUNCTION cds_tabfunc.
     * 
     * @see {@link https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS-METHODS_FOR_TABFUNC.html}
     */
    for_table_function_spec: $ => seq(
        ...kws("for", "table", "function"),
        field("table_function", $.identifier)
    ),

    /**
     * FOR SCALAR FUNCTION cds_scalar_func.
     * 
     * @see {@link https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS-METHODS_FOR_SCALFUNC.html}
     */
    for_scalar_function_spec: $ => seq(
        ...kws("for", "scalar", "function"),
        field("scalar_function", $.identifier),
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHODS_EVENT_HANDLER.html
    for_event_spec: $ => seq(
        ...kws("for", "event"),
        field("name", $.identifier),
        kw("of"),
        field("source", $.identifier),
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHODS_DEFAULT.html
    interface_default_spec: _ => seq(
        kw("default"),
        field("default", choice(...kws("ignore", "fail")))
    ),

    parameter_list: $ => seq(
        repeat1($.parameter),
        optional($.preferred_param_spec)
    ),

    exception_list: $ => repeat1($.identifier),

    raising_list: $ => repeat1(choice(
        $.resumable_exception_spec,
        $.simple_exception_spec
    )),

    /**
     * VALUE(p1) | REFERENCE(p1) | p1 } 
     *   typing [OPTIONAL|{DEFAULT def1}] 
     * 
     * @see {@link https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHODS_PARAMETERS.html}
     * 
     */
    parameter: $ => prec.right(seq(
        choice(
            $.simple_param_spec,
            $.reference_param_spec,
            $.value_param_spec,
        ),
        optional(field("typing", $._typing)),
        optional(choice(
            $.optional_spec,
            field("default", $.param_default_value_spec),
        ))
    )),

    preferred_param_spec: $ => seq(
        ...kws("preferred", "parameter"),
        field("name", $.identifier)
    ),

    optional_spec: _ => kw("optional"),

    param_default_value_spec: $ => seq(
        kw("default"),
        field("value", choice(
            $.identifier, // constant
            $.number,
            $.string_literal
        ))
    ),

    simple_param_spec: $ => seq(
        optional("!"),
        field("name", $.identifier),
    ),

    value_param_spec: $ => seq(
        kw("value"),
        token.immediate("("),
        field("name", $._immediate_identifier),
        token.immediate(")"),
    ),

    reference_param_spec: $ => seq(
        kw("reference"),
        token.immediate("("),
        field("name", $._immediate_identifier),
        token.immediate(")"),
    ),

    resumable_exception_spec: $ => seq(
        kw("resumable"),
        token.immediate("("),
        field("name", $._immediate_identifier),
        token.immediate(")"),
    ),

    simple_exception_spec: $ => field("name", $.identifier),

    method_body: $ => repeat1($._statement),
}

function params(keyword, rule) {
    return field(keyword, seq(kw(keyword), rule));
}