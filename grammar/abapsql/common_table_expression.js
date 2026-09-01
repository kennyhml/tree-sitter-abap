module.exports = {
  /**
   * WITH { cte1, cte2, ... SELECT mainquery | (select_syntax) }
   *   INTO|APPENDING target [UP TO ...] [OFFSET ...] [OPTIONS ...].
   *   ...
   * [ENDWITH].
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPWITH.html
   */
  with_statement: $ =>
    seq(
      $.__with_statement_prefix,
      ".",
      optional(
        seq(
          optional(field("body", $.statement_block)),
          gen.kw("endwith"),
          ".",
        ),
      ),
    ),

  __with_statement_prefix: $ =>
    seq(
      gen.kw("with"),
      choice(
        $.__dynamic_with_statement,
        seq(
          gen.commaSep1($.common_table_expression),
          field("query", $.sql_main_query),
        ),
      ),
    ),

  sql_main_query: $ =>
    choice($._select_statement_prefix, $._select_set_statement_prefix),

  __dynamic_with_statement: $ =>
    seq(
      $.dynamic_spec,
      choice($.select_into_spec, $.select_appending_spec),
      optional(
        choice(
          seq($.select_up_to_spec, optional($.select_offset_spec)),
          seq($.select_offset_spec, optional($.select_up_to_spec)),
        ),
      ),
      optional($.sql_options_spec),
    ),

  /**
   * +cte[( name1, name2, ... )] AS ( SELECT subquery_clauses ... )
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPWITH_SUBQUERY.html
   */
  common_table_expression: $ =>
    seq(
      field("name", $.cte_name),
      optional($.cte_field_list),
      $.cte_as_subquery_spec,
    ),

  cte_name: $ => seq("+", field("name", $._immediate_identifier)),

  cte_field_list: $ =>
    seq(token.immediate("("), gen.commaSep1($.identifier), ")"),

  cte_as_subquery_spec: $ =>
    seq(
      gen.kw("as"),
      gen.parenthesized(alias($.__cte_subquery, $.sql_subquery)),
    ),

  __cte_subquery: $ =>
    choice(
      seq(gen.kw("select"), $.__cte_subquery_clause),
      $.sql_set_expression,
    ),

  __cte_subquery_clause: $ =>
    seq(
      choice(
        seq($.from_database_source_spec, $.select_fields_spec),
        seq($.select_list, $.from_database_source_spec),
      ),
      optional($._sql_where_condition_spec),
      optional($.select_group_by_spec),
      optional($.having_condition_spec),
      optional(
        seq(
          $.select_order_by_spec,
          optional(seq($.select_up_to_spec, optional($.select_offset_spec))),
        ),
      ),
      optional($.sql_database_hints_spec),
    ),
};
