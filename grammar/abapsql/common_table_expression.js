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
          // only when endwith is appended
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

  // Main query of the WITH statement (using the CTES)
  sql_main_query: $ =>
    choice($._select_statement_prefix, $._select_set_statement_prefix),

  // Dynamic spec of the ctes + main query, so that leaves the remaining
  // main query clauses to be called manually
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
      optional($.with_associations_spec),
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

  /**
   * Expose existing associations or define new associations for a CTE.
   *
   * ... WITH ASSOCIATIONS ( path | join [, path | join ...] )
   *                     | (assoc_syntax) ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPWITH_ASSOCIATIONS.html
   */
  with_associations_spec: $ =>
    seq(
      ...gen.kws("with", "associations"),
      choice(
        gen.parenthesized(gen.commaSep1($.__with_association)),
        field("syntax", $.dynamic_spec),
      ),
    ),

  __with_association: $ =>
    choice($.with_association_path, $.with_defined_association),

  /**
   * ... sql_path [AS alias] [REDIRECTED TO +cte VIA target] ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPWITH_ASSOCIATIONS_USING.html
   */
  with_association_path: $ =>
    seq(
      optional(
        seq(
          field("source", choice($.identifier, $.cte_name)),
          token.immediate("~"),
        ),
      ),
      repeat1($.sql_path_association),
      optional($.association_alias_spec),
      optional($.association_redirected_to_spec),
    ),

  association_alias_spec: $ =>
    seq(gen.kw("as"), field("alias", $.identifier)),

  association_redirected_to_spec: $ =>
    seq(
      ...gen.kws("redirected", "to"),
      field("cte", $.cte_name),
      gen.kw("via"),
      field("target", choice($.identifier, $.cte_name)),
    ),

  /**
   * ... JOIN cardinality target AS _assoc ON sql_cond ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPWITH_ASSOCIATIONS_DEFINING.html
   */
  with_defined_association: $ =>
    seq(
      gen.kw("join"),
      field("cardinality", $.sql_association_cardinality),
      field("target", choice($.identifier, $.cte_name)),
      $.association_alias_spec,
      $.sql_join_condition_spec,
    ),
};
