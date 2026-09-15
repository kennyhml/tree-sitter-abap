module.exports = {
  /**
   * UPDATE target source
   *   [OPTIONS]
   *   [PRIVILEGED ACCESS]
   *   [CONNECTION ...].
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPUPDATE.html
   */
  sql_update_statement: $ => seq($.__sql_update_prefix, "."),

  __sql_update_prefix: $ =>
    seq(
      gen.kw("update"),
      field("target", choice($.identifier, $.dynamic_spec)),
      optional(choice($.sql_using_client_spec, $.sql_client_specified_spec)),
      optional($.connection_spec),
      choice(
        field("set", $.sql_update_set_spec),
        field("from", $.sql_update_from_spec),
      ),
      optional(field("options", $.sql_options_spec)),
    ),

  /**
   * ... SET set_expression1, set_expression2, ...
   *   [WHERE sql_cond]
   *   [db_hints] ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPUPDATE_SOURCE.html
   */
  sql_update_set_spec: $ =>
    seq(
      gen.kw("set"),
      choice(gen.commaSep1($.sql_update_set_expression), $.dynamic_spec),
      optional(field("where", $._sql_where_condition_spec)),
      optional(field("hints", $.sql_database_hints_spec)),
    ),

  /**
   * ... { col = f }
   *   | { col = col + f }
   *   | { col = col - f }
   *   | (expr_syntax) ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPUPDATE_SET_EXPRESSION.html
   */
  sql_update_set_expression: $ =>
    seq(
      field("field", $.sql_column_spec),
      "=",
      field("value", $._sql_expression),
    ),

  /**
   * ... FROM { @wa|@( expr ) | TABLE @itab|@( expr ) }
   *   [INDICATORS [NOT] SET STRUCTURE set_ind]
   *   [MAPPING FROM ENTITY] ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPUPDATE_SOURCE.html
   */
  sql_update_from_spec: $ =>
    seq(
      gen.kw("from"),
      optional(gen.kw("table")),
      field("source", choice($.sql_host_expression, $.sql_host_variable)),
      optional(field("indicators", $.sql_update_indicators_spec)),
      optional($.mapping_from_entity),
    ),

  /**
   * ... INDICATORS {[NOT] SET STRUCTURE set_ind}
   *              | (indicator_syntax) ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPUPDATE_SET_INDICATOR.html
   */
  sql_update_indicators_spec: $ =>
    seq(
      gen.kw("indicators"),
      choice(
        seq(
          optional(gen.kw("not")),
          ...gen.kws("set", "structure"),
          field("indicator", $.name_reference),
        ),
        field("syntax", $.dynamic_spec),
      ),
    ),
};
