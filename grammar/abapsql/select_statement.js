module.exports = {
  /**
   * SELECT mainquery_clauses
   *   [UNION|INTERSECT|EXCEPT ...]
   *   INTO|APPENDING target
   *   [UP TO ...] [OFFSET ...]
   *   [OPTIONS ...].
   *   ...
   * [ENDSELECT].
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPSELECT.html
   */
  select_statement: $ =>
    seq(
      $.__select_statement_prefix,
      ".",
      optional(seq(gen.kw("endselect"), ".")),
    ),

  __select_statement_prefix: $ =>
    seq(
      gen.kw("select"),
      $.__mainquery_clause,
      choice($.select_into_spec, $.select_appending_spec),
      optional(
        choice(
          seq($.select_up_to_spec, optional($.select_offset_spec)),
          seq($.select_offset_spec, optional($.select_up_to_spec)),
        ),
      ),
      optional($.sql_options_spec),
    ),

  // https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABENWHERE_LOGEXP_SUBQUERY.html
  sql_subquery: $ => seq(gen.kw("select"), $.__mainquery_clause),

  /**
   * ... [SINGLE [FOR UPDATE]]
   *     { FROM source
   *       FIELDS select_clause }
   *   | { select_clause
   *       FROM source }
   *     [[FOR ALL ENTRIES IN itab]
   *       WHERE sql_cond]
   *     [GROUP BY group] [HAVING group_cond]
   *     [ORDER BY sort_key]
   *     [db_hints] ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPSELECT_MAINQUERY.html
   */
  __mainquery_clause: $ =>
    seq(
      optional(seq($.single, optional($.for_update))),
      choice(
        seq($.from_database_source_spec, $.select_fields_spec),
        seq($.select_list, $.from_database_source_spec),
      ),
      optional($.for_all_entries_in_spec),
      optional($._sql_where_condition_spec),
      optional($.select_group_by_spec),
      optional($.having_condition_spec),
      optional($.select_order_by_spec),
      optional($.sql_database_hints_spec),
    ),

  /*
   * Specification of the fields to be selected.
   *
   * DISTINCT is technically part of a wrapping clause that we drop here for
   * simplicity.
   *
   * ... *
   *   / {..., data_source ~*, ..., col_spec [AS alias], ...}
   *   / (column_syntax) ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPSELECT_LIST.html
   */
  select_list: $ =>
    seq(
      optional($.distinct),
      choice(
        $.select_wildcard,
        $.dynamic_spec,
        choice(
          gen.commaSep1(
            alias($._comma_sep_select_list_item, $.select_list_item),
          ),
          seq(
            alias($._space_sep_select_list_item, $.select_list_item),
            repeat1(alias($._space_sep_select_list_item, $.select_list_item)),
          ),
        ),
      ),
    ),

  /*
   * ... FOR ALL ENTRIES IN @itab ...
   *
   * The mentioned WHERE clause is part of the mainquery
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABENWHERE_ALL_ENTRIES.html
   */
  for_all_entries_in_spec: $ =>
    seq(
      ...gen.kws("for", "all", "entries", "in"),
      field("source", choice($.sql_host_variable, $.sql_host_expression)),
    ),

  /*
   * ... GROUP BY { { sql_exp1, sql_exp2 ...
   *                 grouping_sets1, grouping_sets2, ...}
   *             | (grouping_syntax) } ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPGROUPBY_CLAUSE.html
   */
  select_group_by_spec: $ =>
    seq(...gen.kws("group", "by"), choice($.group_by_list, $.dynamic_spec)),

  /*
   * ... HAVING rel_exp
   *          | [NOT] sql_cond [AND|OR sql_cond] ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPHAVING_CLAUSE.html
   */
  having_condition_spec: $ =>
    seq(gen.kw("having"), field("condition", $._sql_logical_expression)),

  group_by_list: $ =>
    gen.commaSep1(choice($._sql_expression, $.grouping_sets_spec)),

  /*
   * ... GROUPING SETS ( ( { }
   *                       | { sql_exp1, sql_exp2, ... } ),
   *                     ( { }
   *                       | { sql_exp1, sql_exp2, ... } ), ... ) ...
   */
  grouping_sets_spec: $ =>
    seq(
      ...gen.kws("grouping", "sets"),
      gen.parenthesized(gen.commaSep1($.grouping_set)),
    ),

  // ... ( sql_exp1, sql_exp2 ) ...
  grouping_set: $ =>
    gen.parenthesized(optional(gen.commaSep1($._sql_expression))),

  _comma_sep_select_list_item: $ =>
    choice(
      seq(
        field("expression", $._sql_expression),
        optional(field("alias", $.sql_field_alias_spec)),
      ),
      field(
        "expression",
        alias($.__qualified_select_all_fields, $.qualified_field),
      ),
    ),

  // without comma separation, only limited syntax is possible
  _space_sep_select_list_item: $ =>
    prec(
      -1,
      seq(
        field("expression", $.sql_column_spec),
        optional(field("alias", $.sql_field_alias_spec)),
      ),
    ),

  __qualified_select_all_fields: $ =>
    seq(
      field("source", $.identifier),
      token.immediate("~"),
      field("target", $.select_wildcard),
    ),

  sql_field_alias_spec: $ => seq(gen.kw("as"), field("alias", $.identifier)),

  /*
   * ... ORDER BY { PRIMARY KEY
   *                | sort_key [ASCENDING|DESCENDING]
   *                           [NULLS FIRST|NULLS LAST], ...
   *                | (column_syntax) } ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPORDERBY_CLAUSE.html
   */
  select_order_by_spec: $ =>
    seq(
      ...gen.kws("order", "by"),
      choice($.primary_key, $.order_by_list, $.dynamic_spec),
    ),

  primary_key: _ => seq(...gen.kws("primary", "key")),

  order_by_list: $ => gen.commaSep1($.order_by_field),

  order_by_field: $ =>
    seq(
      $._sql_expression,
      optional(choice($.ascending, $.descending)),
      optional(choice($.nulls_first, $.nulls_last)),
    ),

  /*
   * ... [ASCENDING|DESCENDING] [NULLS FIRST|NULLS LAST] ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPORDERBY_CLAUSE_ADDITIONS.html
   */
  nulls_first: _ => seq(...gen.kws("nulls", "first")),
  nulls_last: _ => seq(...gen.kws("nulls", "last")),

  /*
   * ... { INTO (@elem1, @elem2,  ...) }
   *   / { INTO [CORRESPONDING FIELDS OF] @wa [indicators] }
   *   / { INTO|APPENDING [CORRESPONDING FIELDS OF] TABLE @itab [indicators]
   *                                                      [PACKAGE SIZE n] }
   *     [ extended_result ]
   *     [ creating] ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPINTO_CLAUSE.html
   */
  select_into_spec: $ =>
    seq(
      gen.kw("into"),
      choice(
        $.select_result_targets,
        $.select_result_struct,
        $.select_result_table,
      ),
    ),

  select_appending_spec: $ => seq(gen.kw("appending"), $.select_result_table),

  // ... (@elem1, @elem2, ... ) ...
  select_result_targets: $ =>
    gen.parenthesized(gen.commaSep1($.sql_host_variable)),

  // ... [CORRESPONDING FIELDS OF] wa [indicators] ...
  select_result_struct: $ =>
    seq(
      optional($.corresponding_fields_of),
      field("work_area", $.sql_host_variable),
    ),

  // ... [CORRESPONDING FIELDS OF] TABLE itab [indicators] [PACKAGE SIZE n] ...
  select_result_table: $ =>
    seq(
      optional($.corresponding_fields_of),
      gen.kw("table"),
      field("table", $.sql_host_variable),
      optional($.package_size_spec),
    ),

  // ... FROM source ...
  from_database_source_spec: $ =>
    seq(
      gen.kw("from"),
      choice(
        seq(field("source", $.identifier), optional($.sql_source_alias_spec)),
        field("source", $.dynamic_spec),
        field("source", $.sql_join_expression),
      ),
    ),

  sql_data_source: $ =>
    seq(
      field("source", $.identifier),
      optional(field("alias", $.sql_source_alias_spec)),
    ),

  sql_source_alias_spec: $ => seq(gen.kw("as"), field("alias", $.identifier)),

  // ... PACKAGE SIZE n ...
  package_size_spec: $ =>
    seq(...gen.kws("package", "size"), field("size", $._simple_operand)),

  // ... UP TO n ROWS ...
  select_up_to_spec: $ =>
    seq(
      ...gen.kws("up", "to"),
      field(
        "count",
        choice($.sql_host_expression, $.sql_host_variable, $.number),
      ),
      gen.kw("rows"),
    ),

  // ... OFFSET o ...
  select_offset_spec: $ =>
    seq(
      gen.kw("offset"),
      field(
        "offset",
        choice($.sql_host_expression, $.sql_host_variable, $.number),
      ),
    ),

  // Explicit form ... FIELDS select_clause ...
  select_fields_spec: $ => seq(gen.kw("fields"), $.select_list),

  single: _ => gen.kw("single"),

  select_wildcard: _ => "*",

  distinct: _ => gen.kw("distinct"),

  for_update: _ => seq(...gen.kws("for", "update")),

  corresponding_fields_of: _ =>
    seq(...gen.kws("corresponding", "fields", "of")),
};
