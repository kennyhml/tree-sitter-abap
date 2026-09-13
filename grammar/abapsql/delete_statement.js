module.exports = {
  /**
   * DELETE { FROM target [WHERE ...] [db_hints]
   *                       [ORDER BY ... [OFFSET ...]] [UP TO ... ROWS]
   *        | target FROM source }
   *   [OPTIONS]
   *   [PRIVILEGED ACCESS]
   *   [CONNECTION ...].
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPDELETE_DBTAB.html
   */
  sql_delete_statement: $ => seq($.__sql_delete_prefix, "."),

  __sql_delete_prefix: $ =>
    seq(
      gen.kw("delete"),
      choice(
        // ... FROM target [WHERE] [hints] [ORDER BY ... [OFFSET]] [UP TO n ROWS] ...
        seq(
          $.sql_delete_from_target_spec,
          optional(
            seq(
              optional(
                choice($.sql_using_client_spec, $.sql_client_specified_spec),
              ),
              optional($.connection_spec),
              $.sql_delete_conditions_spec,
            ),
          ),
        ),
        // ... target FROM source ...
        seq(
          field("target", choice($.identifier, $.dynamic_spec)),
          optional(
            choice($.sql_using_client_spec, $.sql_client_specified_spec),
          ),
          optional($.connection_spec),
          field("from", $.sql_delete_from_source_spec),
        ),
      ),
      optional(field("options", $.sql_options_spec)),
    ),

  sql_delete_conditions_spec: $ =>
    choice(
      seq(
        optional(field("where", $._sql_where_condition_spec)),
        optional(field("hints", $.sql_database_hints_spec)),
        choice(
          seq(
            field("order", $.sql_set_order_by_spec),
            choice(
              seq(
                $.select_offset_spec,
                optional(field("limit", $.select_up_to_spec)),
              ),
              field("limit", $.select_up_to_spec),
            ),
          ),
          field("limit", $.select_up_to_spec),
        ),
      ),
      seq(
        field("where", $._sql_where_condition_spec),
        optional(field("hints", $.sql_database_hints_spec)),
      ),
      field("hints", $.sql_database_hints_spec),
    ),

  /**
   * ... { @wa|@( expr ) [MAPPING FROM ENTITY] }
   *   | { TABLE @itab|@( expr ) [MAPPING FROM ENTITY] } ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPDELETE_SOURCE.html
   */
  sql_delete_from_source_spec: $ =>
    seq(
      gen.kw("from"),
      optional(gen.kw("table")),
      field("source", choice($.sql_host_expression, $.sql_host_variable)),
      optional($.mapping_from_entity),
    ),

  sql_delete_from_target_spec: $ =>
    seq(gen.kw("from"), field("target", choice($.identifier, $.dynamic_spec))),
};
