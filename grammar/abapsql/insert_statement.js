module.exports = {
  /**
   * INSERT { INTO target VALUES source
   *        | target FROM source }
   *   [OPTIONS]
   *   [PRIVILEGED ACCESS]
   *   [CONNECTION ...].
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPINSERT_DBTAB.html
   */
  sql_insert_statement: $ => seq($.__sql_insert_prefix, "."),

  __sql_insert_prefix: $ =>
    seq(
      gen.kw("insert"),
      choice(
        seq(
          gen.kw("into"),
          field("target", choice($.identifier, $.dynamic_spec)),
          optional(
            choice($.sql_using_client_spec, $.sql_client_specified_spec),
          ),
          optional($.connection_spec),
          field("values", $.sql_insert_values_spec),
        ),
        seq(
          field("target", choice($.identifier, $.dynamic_spec)),
          optional(
            choice($.sql_using_client_spec, $.sql_client_specified_spec),
          ),
          optional($.connection_spec),
          field("from", $.sql_insert_from_spec),
        ),
      ),
      optional(field("options", $.sql_options_spec)),
    ),

  /**
   * ... VALUES @wa|@( expr ) [MAPPING FROM ENTITY] ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPINSERT_SOURCE.html
   */
  sql_insert_values_spec: $ =>
    seq(
      gen.kw("values"),
      field("source", choice($.sql_host_expression, $.sql_host_variable)),
      optional($.mapping_from_entity),
    ),

  /**
   * ... FROM { @wa|@( expr ) [MAPPING FROM ENTITY]
   *            | TABLE @itab|@( expr ) [MAPPING FROM ENTITY]
   *              [ACCEPTING DUPLICATE KEYS]
   *            | ( SELECT subquery_clauses
   *                [UNION|INTERSECT|EXCEPT ...] ) } ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPINSERT_SOURCE.html
   */
  sql_insert_from_spec: $ =>
    seq(
      gen.kw("from"),
      choice(
        seq(
          field("source", choice($.sql_host_expression, $.sql_host_variable)),
          optional($.mapping_from_entity),
        ),
        seq(
          gen.kw("table"),
          field("source", choice($.sql_host_expression, $.sql_host_variable)),
          optional($.mapping_from_entity),
          optional($.accepting_duplicate_keys),
        ),
        field("query", gen.parenthesized($.sql_subquery)),
      ),
    ),

  accepting_duplicate_keys: _ =>
    seq(...gen.kws("accepting", "duplicate", "keys")),
};
