module.exports = {
  /**
   * OPEN CURSOR [WITH HOLD] @dbcur|@DATA(dbcur) FOR
   *   [WITH +cte1 AS ( SELECT subquery_clauses )[, ...]]
   *   SELECT mainquery_clauses
   *   [{UNION|INTERSECT|EXCEPT} SELECT query_clauses ...]
   *   [ORDER BY ...] [UP TO ...] [OFFSET ...] [OPTIONS ...].
   *
   * OPEN CURSOR [WITH HOLD] @dbcur|@DATA(dbcur) FOR
   *   (select_syntax) [UP TO ...] [OFFSET ...] [OPTIONS ...].
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPOPEN_CURSOR.html
   */
  open_cursor_statement: $ => seq($.__open_cursor_prefix, "."),

  /**
   * FETCH NEXT CURSOR @dbcur INTO|APPENDING ... .
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPFETCH.html
   */
  fetch_next_cursor_statement: $ => seq($.__fetch_next_cursor_prefix, "."),

  /**
   * CLOSE CURSOR @dbcur.
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPCLOSE_CURSOR.html
   */
  close_cursor_statement: $ => seq($.__close_cursor_prefix, "."),

  __close_cursor_prefix: $ =>
    seq(
      ...gen.kws("close", "cursor"),
      field("cursor", $.sql_host_variable),
    ),

  __open_cursor_prefix: $ =>
    seq(
      ...gen.kws("open", "cursor"),
      optional($.with_hold),
      field("cursor", $.sql_host_variable),
      $.cursor_for_query_spec,
    ),

  __fetch_next_cursor_prefix: $ =>
    seq(
      ...gen.kws("fetch", "next", "cursor"),
      field("cursor", $.sql_host_variable),
      choice($.select_into_spec, $.select_appending_spec),
    ),

  cursor_for_query_spec: $ =>
    seq(
      gen.kw("for"),
      choice(
        seq(
          optional(field("with", alias($.__cursor_with_ctes, $.with_spec))),
          field("query", $.cursor_query),
        ),
        field("query", $.dynamic_spec),
      ),
      optional(
        choice(
          seq($.select_up_to_spec, optional($.select_offset_spec)),
          seq($.select_offset_spec, optional($.select_up_to_spec)),
        ),
      ),
      optional($.sql_options_spec),
    ),

  cursor_query: $ =>
    choice(
      seq(gen.kw("select"), $.__mainquery_clause),
      seq($.sql_set_expression, optional($.sql_set_order_by_spec)),
    ),

  // inline WITH block with its main query and dynamic spec stripped
  __cursor_with_ctes: $ =>
    seq(gen.kw("with"), gen.commaSep1($.common_table_expression)),

  with_hold: _ => seq(...gen.kws("with", "hold")),
};
