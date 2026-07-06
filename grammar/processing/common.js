module.exports = {
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
  itab_lines: $ =>
    prec.right(
      repeat1(
        choice(
          $.lines_from,
          $.lines_to,
          $.lines_step,
          $.where_condition,
          $.using_key,
        ),
      ),
    ),

  where_condition: $ =>
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
  lines_of: $ =>
    seq(
      ...gen.kws("lines", "of"),
      field("subject", $.general_expression),
      repeat(choice($.lines_from, $.lines_to, $.lines_step, $.using_key)),
    ),

  /**
   * ... wa
   *     | {INITIAL LINE}
   *     | {LINES OF jtab [FROM idx1] [TO idx2] [STEP n] [USING KEY keyname]} ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPINSERT_ITAB_LINESPEC.html
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPAPPEND_LINESPEC.html
   */
  _line_spec: $ => choice($.general_expression, $.initial_line, $.lines_of),

  lines_from: $ => seq(gen.kw("from"), field("index", $.numeric_expression)),

  lines_to: $ => seq(gen.kw("to"), field("index", $.numeric_expression)),

  lines_step: $ => seq(gen.kw("step"), field("size", $.numeric_expression)),

  using_key: $ => seq(...gen.kws("using", "key"), field("name", $.identifier)),

  // TODO: I feel like we got a few of these floating around
  into: $ =>
    seq(
      gen.kw("into"),
      field("work_area", choice($.named_data_object, $.declaration_expression)),
    ),

  reference_into: $ =>
    seq(
      ...gen.kws("reference", "into"),
      field("work_area", choice($.field_symbol, $.declaration_expression)),
    ),

  /**
   * ASCENDING|DESCENDING [AS TEXT]
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPLOOP_AT_ITAB_GROUP_BY.html
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abapsort_itab.html
   */
  sort_order: $ =>
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
  index: $ =>
    seq(
      gen.kw("index"),
      field("index", $.numeric_expression),
      optional($.using_key),
    ),

  /**
   * Specifies a work area to find a line of an internal table from.
   *
   * ... { FROM wa [USING KEY keyname] } ...
   *
   * Used in, for example:
   * {@link delete_itab_key_spec} @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREAD_TABLE_KEY.html
   */
  from_work_area: $ =>
    seq(
      gen.kw("from"),
      field("work_area", $.general_expression),
      optional($.using_key),
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
  table_key: $ =>
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
  free_key: $ =>
    seq(
      optional(
        seq(
          ...gen.kws(optional("with"), "key"),
          optional(field("name", choice($.identifier, $.dynamic_spec))),
        ),
      ),
      $.key_component_list,
    ),

  initial_line: $ => seq(...gen.kws("initial", "line")),

  key_component_list: $ =>
    seq(
      optional(gen.kw("components")), // can be omitted
      prec.right(repeat1($.itab_comp_spec)),
      optional($.binary_search),
    ),

  itab_comp_spec: $ =>
    seq(field("comp", $.itab_comp), "=", field("value", $.general_expression)),

  /**
   * ... COMPARING {comp1 comp2 ...}|{ALL FIELDS}/{NO FIELDS}]
   *
   * Used in, for example:
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDELETE_DUPLICATES.html
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREAD_TABLE_TRANSPORT_OPTIONS.html
   */
  comparing: $ =>
    seq(
      gen.kw("comparing"),
      choice($.all_fields, $.no_fields, prec.right(repeat1($.itab_comp))),
    ),

  binary_search: _ => seq(...gen.kws("binary", "search")),

  all_fields: _ => seq(...gen.kws("all", "fields")),

  no_fields: _ => seq(...gen.kws("no", "fields")),
};
