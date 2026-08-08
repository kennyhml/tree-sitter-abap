module.exports = {
  // @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPCOMMIT_ENTITIES.html
  commit_entities_statement: $ =>
    seq(
      choice(
        $.__commit_entities_short_form_prefix,
        $.__commit_entities_long_form_prefix,
        $.__commit_entities_dynamic_form_prefix,
      ),
      ".",
    ),

  /*
   * COMMIT ENTITIES [IN SIMULATION MODE] [RESPONSES response_param].
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPEMLCOMMIT_ENTITIES_SHORT.html
   */
  __commit_entities_short_form_prefix: $ =>
    seq(
      ...gen.kws("commit", "entities"),
      optional($.in_simulation_mode),
      optional($.responses_spec),
    ),

  /*
   * COMMIT ENTITIES [IN SIMULATION MODE] RESPONSE OF bdef1 response_param
   *                                     [RESPONSE OF bdef2 response_param ]
   *                                     [...].
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPEMLCOMMIT_ENTITIES_LONG.html
   */
  __commit_entities_long_form_prefix: $ =>
    seq(
      ...gen.kws("commit", "entities"),
      optional($.in_simulation_mode),
      repeat1($.response_of_spec),
    ),

  /*
   * COMMIT ENTITIES [IN SIMULATION MODE] RESPONSES OF dyn_tab response_param.
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPEMLCOMMIT_ENTITIES_DYN.html
   */
  __commit_entities_dynamic_form_prefix: $ =>
    seq(
      ...gen.kws("commit", "entities"),
      optional($.in_simulation_mode),
      $.responses_of_spec,
    ),

  // ... RESPONSES response_param ...
  responses_spec: $ => seq(gen.kw("responses"), $.response_parameters),

  // ... RESPONSE OF bdef1 response_param ...
  response_of_spec: $ =>
    seq(
      ...gen.kws("response", "of"),
      field("business_object", $.business_object),
      $.response_parameters,
    ),

  // ... RESPONSES OF bdef1 response_param ...
  responses_of_spec: $ =>
    seq(
      ...gen.kws("responses", "of"),
      field("value", $.general_expression),
      $.response_parameters,
    ),

  in_simulation_mode: _ => seq(...gen.kws("in", "simulation", "mode")),
};
