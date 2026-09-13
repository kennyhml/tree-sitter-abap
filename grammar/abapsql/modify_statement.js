module.exports = {
  /**
   * MODIFY target FROM source
   *   [OPTIONS]
   *   [PRIVILEGED ACCESS]
   *   [CONNECTION ...].
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPMODIFY_DBTAB.html
   */
  sql_modify_statement: $ => seq($.__sql_modify_prefix, "."),

  __sql_modify_prefix: $ =>
    seq(
      gen.kw("modify"),
      field("target", choice($.identifier, $.dynamic_spec)),
      optional(choice($.sql_using_client_spec, $.sql_client_specified_spec)),
      optional($.connection_spec),
      field("from", $.sql_modify_from_spec),
      optional(field("options", $.sql_options_spec)),
    ),

  sql_client_specified_spec: _ =>
    seq(...gen.kws("client", "specified")),

  /**
   * ... { @wa|@( expr ) [MAPPING FROM ENTITY] }
   *   | { TABLE @itab|@( expr ) [MAPPING FROM ENTITY] }
   *   | { ( SELECT subquery_clauses
   *         [UNION|INTERSECT|EXCEPT ...] ) } ...
   */
  sql_modify_from_spec: $ =>
    seq(
      gen.kw("from"),
      choice(
        seq(
          optional(gen.kw("table")),
          choice($.sql_host_expression, $.sql_host_variable),
          optional($.mapping_from_entity),
        ),
        gen.parenthesized($.sql_subquery),
      ),
    ),
};
