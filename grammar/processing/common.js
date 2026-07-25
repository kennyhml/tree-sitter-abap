module.exports = {
  // Shared by string, assignment, and RTTS statements.
  _processing_mode_spec: $ =>
    choice($.in_character_mode_spec, $.in_byte_mode_spec),

  in_character_mode_spec: _ => seq(...gen.kws("in", "character", "mode")),

  in_byte_mode_spec: _ => seq(...gen.kws("in", "byte", "mode")),

  time_zone_spec: $ =>
    seq(...gen.kws("time", "zone"), field("value", $.general_expression)),

  else_unassign: _ => seq(...gen.kws("else", "unassign")),

  /**
   * Specifies which lines of an internal table to consider for various expressions.
   *
   *  ... [USING KEY keyname]
   *      [FROM idx1] [TO idx2] [STEP n]
   *      [WHERE log_exp |(cond_syntax)] ...
   *
   * Used in:
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDELETE_ITAB_LINES.html
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPLOOP_AT_ITAB_COND.html
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENFOR_COND.html
   */
  itab_lines_spec: $ =>
    prec.right(
      repeat1(
        choice(
          $.lines_from_spec,
          $.lines_to_spec,
          $.lines_step_spec,
          $.where_condition_spec,
          $.using_key_spec,
        ),
      ),
    ),

  where_condition_spec: $ =>
    seq(
      gen.kw("where"),
      field(
        "condition",
        choice(
          $._member_logical_expression,

          // statically specified logical expression log_exp must be placed in parenthese (table iterations)
          // The parantheses here could cause a conflict with logical expressions, so they need a higher precedence.
          prec(2, gen.parenthesized($._member_logical_expression)),

          // dynamic where clause
          $.dynamic_spec,
          $.dynamic_condition_tab,
        ),
      ),
    ),

  dynamic_condition_tab: $ => gen.parenthesized($.dynamic_spec),

  /**
   *  ... {LINES OF jtab [FROM idx1] [TO idx2] [STEP n] [USING KEY keyname]} ...
   *
   * Needs to be left associative due to append statement (both use TO ... )
   *
   * Used in:
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPAPPEND_LINESPEC.html
   */
  lines_of_spec: $ =>
    seq(
      ...gen.kws("lines", "of"),
      field("subject", $.general_expression),
      repeat(
        choice(
          $.lines_from_spec,
          $.lines_to_spec,
          $.lines_step_spec,
          $.using_key_spec,
        ),
      ),
    ),

  /**
   * ... wa
   *     | {INITIAL LINE}
   *     | {LINES OF jtab [FROM idx1] [TO idx2] [STEP n] [USING KEY keyname]} ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPINSERT_ITAB_LINESPEC.html
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPAPPEND_LINESPEC.html
   */
  _line_spec: $ =>
    choice($.general_expression, $.initial_line_spec, $.lines_of_spec),

  lines_from_spec: $ =>
    seq(gen.kw("from"), field("index", $.numeric_expression)),

  lines_to_spec: $ =>
    seq(gen.kw("to"), field("index", $.numeric_expression)),

  lines_step_spec: $ =>
    seq(gen.kw("step"), field("size", $.numeric_expression)),

  using_key_spec: $ =>
    seq(...gen.kws("using", "key"), field("name", $.identifier)),

  // TODO: I feel like we got a few of these floating around
  into_spec: $ =>
    seq(
      gen.kw("into"),
      field("work_area", choice($.named_data_object, $.declaration_expression)),
    ),

  /**
   * ASCENDING|DESCENDING [AS TEXT]
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPLOOP_AT_ITAB_GROUP_BY.html
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abapsort_itab.html
   */
  sort_order_spec: $ =>
    seq(
      field("direction", choice($.ascending, $.descending)),
      optional($.as_text),
    ),

  as_text: _ => seq(...gen.kws("as", "text")),

  ascending: _ => gen.kw("ascending"),

  descending: _ => gen.kw("descending"),

  /**
   * Specifies an index for various expressions.
   *
   * ... INDEX idx [USING KEY key] ...
   */
  index_spec: $ =>
    seq(
      gen.kw("index"),
      field("index", $.numeric_expression),
      optional($.using_key_spec),
    ),

  /**
   * Specifies a work area to find a line of an internal table from.
   *
   * ... { FROM wa [USING KEY keyname] } ...
   *
   * Used in, for example:
   * {@link delete_itab_key_spec} @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREAD_TABLE_KEY.html
   */
  from_work_area_spec: $ =>
    seq(
      gen.kw("from"),
      field("work_area", $.general_expression),
      optional($.using_key_spec),
    ),

  /**
   * Specifies a table key to read from an internal table
   *
   *  {TABLE KEY [keyname COMPONENTS]
   *             {comp_name1|(name1)} = operand1
   *             {comp_name2|(name2)} = operand2
   *              ...                             } ...
   *
   * Alternative to {@link itab_work_area_spec}
   */
  table_key_spec: $ =>
    seq(
      ...gen.kws(optional("with"), "table", "key"),
      optional(field("name", choice($.identifier, $.dynamic_spec))),
      $.key_component_list,
    ),

  /**
   * Specifies a free search key, optionally linked to a key
   *
   *  {KEY keyname [COMPONENTS]
   *        {comp_name1|(name1)} = operand1
   *        {comp_name2|(name2)} = operand2
   *        ... } ...
   *
   * or
   *
   * ... WITH KEY { comp1 = operand1 comp2 = operand2 ... [BINARY SEARCH] }
   *         | { keyname COMPONENTS comp1 = operand1 comp2 = operand2 ... } ...
   */
  free_key_spec: $ =>
    seq(
      optional(
        seq(
          ...gen.kws(optional("with"), "key"),
          optional(field("name", choice($.identifier, $.dynamic_spec))),
        ),
      ),
      $.key_component_list,
    ),

  initial_line_spec: $ => seq(...gen.kws("initial", "line")),

  key_component_list: $ =>
    seq(
      optional(gen.kw("components")), // can be omitted
      prec.right(repeat1($.itab_comp_spec)),
      optional($.binary_search),
    ),

  itab_comp_spec: $ =>
    seq(field("comp", $.itab_comp), "=", field("value", $.general_expression)),

  binary_search: _ => seq(...gen.kws("binary", "search")),

  all_fields: _ => seq(...gen.kws("all", "fields")),

  no_fields: _ => seq(...gen.kws("no", "fields")),
};
