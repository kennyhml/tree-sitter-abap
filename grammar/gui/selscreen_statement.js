// https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abapselection-screen.html
module.exports = {
  selection_screen_statement: $ => seq($.__selection_screen_statement_prefix, "."),

  __selection_screen_statement_prefix: $ =>
    gen.chainable("selection-screen", $.__selection_screen_element),

  /**
   * Any element that is preceded by a `SELECTION_SCREEN` or `SELECTION_SCREEN:`.
   *
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN.html
   */
  __selection_screen_element: $ =>
    choice(
      // (Visual) screen elements
      $.begin_of_screen_element_spec,
      $.end_of_screen_element_spec,
      $.begin_of_block_element_spec,
      $.end_of_block_element_spec,
      $.begin_of_tabbed_block_element_spec,
      $.horizontal_line_element_spec,
      $.comment_element_spec,
      $.pushbutton_element_spec,
      $.tab_element_spec,

      // Directives
      $.blank_line_directive_spec,
      $.begin_of_line_directive_spec,
      $.end_of_line_directive_spec,
      $.screen_position_directive_spec,
      $.function_key_directive_spec,

      // Include elements
      $.include_parameter_directive_spec,
      $.include_select_option_directive_spec,
      $.include_comment_directive_spec,
      $.include_pushbutton_directive_spec,
      $.include_block_directive_spec,
    ),

  // [[/][pos|POS_LOW|POS_HIGH](len)
  output_position_spec: $ =>
    prec.right(
      repeat1(
        choice(
          "/",
          field(
            "position",
            choice(
              $.number,
              alias(choice("POS_LOW", "POS_HIGH"), $.identifier),
            ),
          ),
          gen.immediateTightParens(field("length", $.number)),
        ),
      ),
    ),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_NORMAL.html
  begin_of_screen_element_spec: $ =>
    prec.right(
      seq(
        ...gen.kws("begin", "of", "screen"),
        gen.chainable_immediate(choice($.screen_spec, $.subscreen_spec)),
      ),
    ),

  // Inner spec of a screen element to support chaining.
  screen_spec: $ =>
    seq(
      field("dynnr", $.number),
      repeat(choice($.title_spec, $.as_window_spec)),
    ),

  // Inner spec of a subscreen element to support chaining.
  subscreen_spec: $ =>
    seq(
      field("dynnr", $.number),
      ...gen.kws("as", "subscreen"),
      repeat(choice($.nesting_level_spec, $.no_intervals_spec)),
    ),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_TABBED.html
  begin_of_tabbed_block_element_spec: $ =>
    seq(...gen.kws("begin", "of", "tabbed", "block"), $.__tabbed_block_spec),

  __tabbed_block_spec: $ =>
    seq(
      field("name", $.identifier),
      $.tab_lines_spec,
      optional($.no_intervals_spec),
    ),

  /**
   * Tab element (button) of a tabbed block.
   *
   * [SELECTION-SCREEN TAB (len) tab USER-COMMAND fcode
   *      [DEFAULT [PROGRAM prog] SCREEN dynnr]
   *      [MODIF ID modid]
   *      [ldb_additions].]
   *
   * Refer to {@link begin_of_tabbed_block_element_spec}
   */
  tab_element_spec: $ =>
    prec.right(seq(gen.kw("tab"), gen.chainable_immediate($.tab_spec))),

  // Inner spec of a tab element to support chaining.
  tab_spec: $ =>
    seq(
      "(",
      field("length", $._immediate_number),
      token.immediate(")"),

      field("name", $.identifier),
      $.user_command_spec,
      repeat(choice($.default_tab_screen_spec, $.modif_id_spec)),
    ),

  /**
   * Closes a {@link begin_of_screen_element_spec} or {@link begin_of_subscreen_statement}
   */
  end_of_screen_element_spec: $ =>
    prec.right(
      seq(
        ...gen.kws("end", "of", "screen"),
        gen.chainable_immediate($.end_of_screen_spec),
      ),
    ),

  end_of_screen_spec: $ => field("dynnr", $.number),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_BLOCK.html
  begin_of_block_element_spec: $ =>
    prec.right(seq(...gen.kws("begin", "of", "block"), $.__block_spec)),

  __block_spec: $ =>
    seq(
      field("name", $.identifier),
      repeat(choice($.frame_spec, $.no_intervals_spec)),
    ),

  /**
   * Closes a {@link begin_of_block_element_spec} or {@link begin_of_tabbed_block_element_spec}.
   */
  end_of_block_element_spec: $ =>
    prec.right(
      seq(
        ...gen.kws("end", "of", "block"),
        gen.chainable_immediate($.end_of_block_spec),
      ),
    ),

  end_of_block_spec: $ => field("name", $.identifier),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_SKIP.html
  blank_line_directive_spec: $ =>
    prec.right(
      seq(
        gen.kw("skip"),
        optional(gen.chainable_immediate($.blank_line_spec)),
      ),
    ),

  blank_line_spec: $ => field("times", $.number),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_ULINE.html
  horizontal_line_element_spec: $ => seq(gen.kw("uline"), $.__uline_spec),

  __uline_spec: $ => repeat1(choice($.output_position_spec, $.modif_id_spec)),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_COMMENT.html
  comment_element_spec: $ =>
    prec.right(seq(gen.kw("comment"), gen.chainable_immediate($.comment_spec))),

  // Inner spec of a block element to support chaining.
  comment_spec: $ =>
    seq(
      $.output_position_spec,
      optional(field("name", $.__element_text_variable)),
      optional($.for_screen_field_spec),
      repeat(choice($.visible_length_spec, $.modif_id_spec)),
    ),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_COMMENT.html
  pushbutton_element_spec: $ =>
    seq(
      gen.kw("pushbutton"),
      $.output_position_spec,
      field("name", $.__element_text_variable),
      $.user_command_spec,
      repeat(choice($.visible_length_spec, $.modif_id_spec)),
    ),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_LINE.html
  begin_of_line_directive_spec: _ =>
    seq(...gen.kws("begin", "of", "line")),

  screen_position_directive_spec: $ =>
    seq(gen.kw("position"), $.output_position_spec),

  /**
   * Since this only actives an existing element (key 0 to 5) this should
   * be considered a directive rather than an element.
   *
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_FUNCTIONKEY.html
   */
  function_key_directive_spec: $ =>
    prec.left(
      seq(
        ...gen.kws("function", "key"),
        choice(
          // function key: 1, 2...
          seq(":", gen.commaSep1(field("key", $.number))),
          field("key", $.number),
        ),
      ),
    ),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_INCLUDE_PARAM.html
  include_parameter_directive_spec: $ =>
    seq(
      ...gen.kws("include", "parameters"),
      field("name", $.identifier),
      repeat(choice($.obligatory_spec, $.modif_id_spec)),
    ),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_INCLUDE_SELOP.html
  include_select_option_directive_spec: $ =>
    seq(
      ...gen.kws("include", "select-options"),
      field("name", $.identifier),
      repeat(
        choice(
          $.obligatory_spec,
          $.no_intervals_spec,
          $.no_extension_spec,
          $.modif_id_spec,
        ),
      ),
    ),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_INCLUDE_COMNT.html
  include_comment_directive_spec: $ =>
    seq(
      ...gen.kws("include", "comment"),
      $.output_position_spec,
      repeat(choice($.for_screen_field_spec, $.modif_id_spec)),
    ),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_INCLUDE_PUSHB.html
  include_pushbutton_directive_spec: $ =>
    seq(
      ...gen.kws("include", "pushbutton"),
      $.output_position_spec,
      field("name", $.__element_text_variable),
      repeat(choice($.user_command_spec, $.modif_id_spec)),
    ),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_INCLUDE_BLOCK.html
  include_block_directive_spec: $ =>
    seq(...gen.kws("include", "blocks"), field("name", $.identifier)),

  end_of_line_directive_spec: _ => seq(...gen.kws("end", "of", "line")),

  for_screen_field_spec: $ =>
    seq(...gen.kws("for", "field"), field("name", $.identifier)),

  title_spec: $ => seq(gen.kw("title"), field("text", $.data_object)),

  frame_spec: $ => seq(...gen.kws("with", "frame"), optional($.title_spec)),

  nesting_level_spec: $ =>
    seq(...gen.kws("nesting", "level"), field("level", $.number)),

  tab_lines_spec: $ =>
    seq(gen.kw("for"), field("number", $.number), gen.kw("lines")),

  default_tab_screen_spec: $ =>
    seq(
      gen.kw("default"),
      optional(seq(gen.kw("program"), field("program", $.identifier))),
      gen.kw("screen"),
      field("dynnr", $.number),
    ),

  as_window_spec: _ => seq(...gen.kws("as", "window")),

  /**
   * CALL SELECTION-SCREEN dynnr
   *      [STARTING AT col1 lin1
   *      [ENDING   AT col2 lin2]]
   *      [USING SELECTION-SET variant].
   *
   * https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPCALL_SELECTION_SCREEN.html
   */
  call_sel_screen_statement: $ =>
    seq(
      ...gen.kws("call", "selection-screen"),
      field("dynnr", $.data_object),
      repeat(
        choice(
          $.starting_at_spec,
          $.ending_at_spec,
          $.using_selection_set_spec,
        ),
      ),
    ),

  /**
   * Addition ...[STARTING AT col2 lin2] {@link call_sel_screen_statement}
   */
  starting_at_spec: $ =>
    seq(
      ...gen.kws("starting", "at"),
      field("column", $.data_object),
      field("line", $.data_object),
    ),

  /**
   * Addition ...[ENDING AT col2 lin2] {@link call_sel_screen_statement}
   */
  ending_at_spec: $ =>
    seq(
      ...gen.kws("ending", "at"),
      field("column", $.data_object),
      field("line", $.data_object),
    ),

  /**
   * Addition ... USING SELECTION-SET variant of {@link call_sel_screen_statement}
   */
  using_selection_set_spec: $ =>
    seq(...gen.kws("using", "selection-set"), field("name", $.data_object)),

  __element_text_variable: $ => choice($.identifier, $.text_symbol),
};
