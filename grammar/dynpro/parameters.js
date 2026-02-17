const gen = require("../core/generators.js")

module.exports = {

    parameters_declaration: $ => gen.chainable(
        "parameters", $.parameters_spec
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPPARAMETERS.html
    parameters_spec: $ => seq(
        field("name", $.identifier),
        repeat(
            choice(
                field("typing", $._typing),
                $.__parameter_screen_option,
                $.__parameter_value_option,
            )
        )
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPPARAMETERS_SCREEN.html
    __parameter_screen_option: $ => choice(
        field("visible_length", $.visible_length_spec),
        field("user_command", $.user_command_spec),

        field("checkbox", $.checkbox_spec),
        field("radiobutton", $.radiobutton_spec),
        field("listbox", $.listbox_spec),

        field("obligatory", $.obligatory_spec),
        field("display", $.no_display_spec),
        field("modif_id", $.modif_id_spec),
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPPARAMETERS_VALUE.html
    __parameter_value_option: $ => choice(
        field("default", $.default_value_spec),
        field("case", $.lower_case_spec),
        field("search_help", $.search_help_spec),
        field("memory_id", $.memory_id_spec),
        field("value_check", $.value_check_spec),
    ),

    radiobutton_spec: $ => seq(
        ...gen.kws("radiobutton", "group"),
        field("group", $.identifier),
    ),

    checkbox_spec: _ => seq(...gen.kws("as", "checkbox")),

    value_check_spec: _ => seq(...gen.kws("value", "check")),

    listbox_spec: _ => seq(...gen.kws("as", "listbox")),

}