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
      optional($._sql_where_condition_spec),
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
          seq($._select_list_field, repeat1(seq(",", $._select_list_field))),
          repeat1($._select_list_field),
        ), // TODO: col spec
      ),
    ),

  _select_list_field: $ => choice($.qualified_field, $.identifier),

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
    seq(gen.kw("from"), field("source", $.identifier)),

  // ... PACKAGE SIZE n ...
  package_size_spec: $ =>
    seq(...gen.kws("package", "size"), field("size", $._simple_operand)),

  // Explicit form ... FIELDS select_clause ...
  select_fields_spec: $ => seq(gen.kw("fields"), $.select_list),

  single: _ => gen.kw("single"),

  qualified_field: $ =>
    seq(
      field("source", $.identifier),
      token.immediate("~"),
      field("target", choice($.select_wildcard, $.identifier)),
    ),

  select_wildcard: _ => "*",

  distinct: _ => gen.kw("distinct"),

  for_update: _ => seq(...gen.kws("for", "update")),

  corresponding_fields_of: _ =>
    seq(...gen.kws("corresponding", "fields", "of")),
};
