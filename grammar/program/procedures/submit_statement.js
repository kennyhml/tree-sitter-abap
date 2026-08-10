module.exports = {
  /**
   * SUBMIT {rep|(name)} [selscreen_options]
   *                     [list_options]
   *                     [job_options]
   *                     [AND RETURN].
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPSUBMIT.html
   */
  submit_statement: $ => seq($.__submit_prefix, "."),

  __submit_prefix: $ =>
    seq(
      gen.kw("submit"),
      field("report", choice($.identifier, $.dynamic_spec)),
      repeat($.__selscreen_options),
      repeat($.__list_options),
      optional($.__job_options),
      optional($.and_return),
    ),

  /**
   * ... [USING SELECTION-SCREEN dynnr]
   *     [VIA SELECTION-SCREEN]
   *     [selscreen_parameters] ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPSUBMIT_INTERFACE.html
   */
  __selscreen_options: $ =>
    choice(
      $.using_selection_screen_spec,
      $.via_selection_screen,
      $.__selscreen_parameters,
    ),

  using_selection_screen_spec: $ =>
    seq(
      ...gen.kws("using", "selection-screen"),
      field("number", $.data_object),
    ),

  via_selection_screen: _ => seq(...gen.kws("via", "selection-screen")),

  /**
   * ... [USING SELECTION-SET variant]
   *     [USING SELECTION-SETS OF PROGRAM prog]
   *     [WITH SELECTION-TABLE rspar]
   *     [WITH expr_syntax1 WITH expr_syntax2 ...]
   *     [WITH FREE SELECTIONS texpr] ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPSUBMIT_SELSCREEN_PARAMETERS.html
   */
  __selscreen_parameters: $ =>
    choice(
      $.using_selection_set_spec,
      $.using_selection_sets_of_program_spec,
      $.with_selection_table_spec,
      $.with_selection_criteria_spec,
      $.with_free_selections_spec,
    ),

  using_selection_set_spec: $ =>
    seq(
      ...gen.kws("using", "selection-set"),
      field("name", $.data_object),
    ),

  using_selection_sets_of_program_spec: $ =>
    seq(
      ...gen.kws("using", "selection-sets", "of", "program"),
      field("program", $.data_object),
    ),

  with_selection_table_spec: $ =>
    seq(
      ...gen.kws("with", "selection-table"),
      field("table", $.data_object),
    ),

  with_selection_criteria_spec: $ =>
    seq(
      gen.kw("with"),
      field("selection", $.identifier),
      choice(
        seq(
          field(
            "operator",
            choice(
              "=",
              ...gen.kws("eq", "ne", "cp", "np", "gt", "ge", "lt", "le", "incl"),
            ),
          ),
          field("value", $.data_object),
          optional($.sign_spec),
        ),
        seq(
          optional(gen.kw("not")),
          gen.kw("between"),
          field("low", $.data_object),
          gen.kw("and"),
          field("high", $.data_object),
          optional($.sign_spec),
        ),
        seq(gen.kw("in"), field("table", $.data_object)),
      ),
    ),

  sign_spec: $ =>
    seq(gen.kw("sign"), field("sign", $.data_object)),

  with_free_selections_spec: $ =>
    seq(
      ...gen.kws("with", "free", "selections"),
      field("selections", $.data_object),
    ),

  /**
   * ... [LINE-SIZE width]
   *     [LINE-COUNT page_lines]
   *     { [EXPORTING LIST TO MEMORY]
   *     | [TO SAP-SPOOL spool_options] } ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPSUBMIT_LIST_OPTIONS.html
   */
  __list_options: $ =>
    choice(
      alias($.__submit_line_size_spec, $.line_size_spec),
      alias($.__submit_line_count_spec, $.line_count_spec),
      $.exporting_list_to_memory,
      $.to_sap_spool_spec,
    ),

  __submit_line_size_spec: $ =>
    seq(gen.kw("line-size"), field("size", $.data_object)),

  __submit_line_count_spec: $ =>
    seq(gen.kw("line-count"), field("page_lines", $.data_object)),

  exporting_list_to_memory: _ =>
    seq(...gen.kws("exporting", "list", "to", "memory")),

  to_sap_spool_spec: $ =>
    seq(...gen.kws("to", "sap-spool"), $.__spool_options),

  /**
   * ... SPOOL PARAMETERS pri_params
   *     [ARCHIVE PARAMETERS arc_params]
   *     WITHOUT SPOOL DYNPRO ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPSUBMIT_PRINT_PARAMETERS.html
   */
  __spool_options: $ =>
    seq(
      $.spool_parameters_spec,
      optional($.archive_parameters_spec),
      $.without_spool_dynpro,
    ),

  spool_parameters_spec: $ =>
    seq(
      ...gen.kws("spool", "parameters"),
      field("parameters", $.data_object),
    ),

  archive_parameters_spec: $ =>
    seq(
      ...gen.kws("archive", "parameters"),
      field("parameters", $.data_object),
    ),

  without_spool_dynpro: _ => seq(...gen.kws("without", "spool", "dynpro")),

  /**
   * ... [USER user] VIA JOB job NUMBER n [LANGUAGE lang] ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPSUBMIT_VIA_JOB.html
   */
  __job_options: $ =>
    seq(
      optional($.job_user_spec),
      $.via_job_number_spec,
      optional($.job_language_spec),
    ),

  via_job_number_spec: $ =>
    seq(
      ...gen.kws("via", "job"),
      field("job", $.data_object),
      gen.kw("number"),
      field("number", $.data_object),
    ),

  job_user_spec: $ =>
    seq(gen.kw("user"), field("name", $.data_object)),

  job_language_spec: $ =>
    seq(gen.kw("language"), field("language", $.data_object)),

  and_return: _ => seq(...gen.kws("and", "return")),
};
