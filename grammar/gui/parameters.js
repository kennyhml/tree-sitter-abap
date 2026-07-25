module.exports = {
  parameters_declaration: $ => seq($.__parameters_declaration_prefix, "."),

  __parameters_declaration_prefix: $ =>
    gen.chainable("parameters", $.parameters_spec),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPPARAMETERS.html
  parameters_spec: $ =>
    seq(
      field("name", $.identifier),
      repeat(
        choice(
          field("typing", $.typing),
          $.__parameter_screen_option,
          $.__parameter_value_option,
        ),
      ),
    ),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPPARAMETERS_SCREEN.html
  __parameter_screen_option: $ =>
    choice(
      field("visible_length", $.visible_length_spec),
      field("user_command", $.user_command_spec),

      field("checkbox", $.as_checkbox_spec),
      field("radiobutton", $.radiobutton_group_spec),
      field("listbox", $.as_listbox_spec),

      field("obligatory", $.obligatory_spec),
      field("display", $.no_display),
      field("modif_id", $.modif_id_spec),
    ),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPPARAMETERS_VALUE.html
  __parameter_value_option: $ =>
    choice(
      field("default", $.default_value_spec),
      field("case", $.lower_case),
      field("search_help", $.search_help_spec),
      field("memory_id", $.memory_id_spec),
      field("value_check", $.value_check),
    ),

  radiobutton_group_spec: $ =>
    seq(...gen.kws("radiobutton", "group"), field("group", $.identifier)),

  as_checkbox_spec: _ => seq(...gen.kws("as", "checkbox")),

  value_check: _ => seq(...gen.kws("value", "check")),

  as_listbox_spec: _ => seq(...gen.kws("as", "listbox")),
};
