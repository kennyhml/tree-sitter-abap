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
  select_statement: $ => seq($.__select_statement_prefix, "."),

  __select_statement_prefix: $ => seq(gen.kw("select"), $.__mainquery_clause),

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
        gen.commaSep1(choice($.qualified_field, $.identifier)), // TODO: col spec
      ),
    ),

  // ... FROM source ...
  from_database_source_spec: $ =>
    seq(gen.kw("from"), field("source", $.identifier)),

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
};
