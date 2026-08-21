module.exports = {
  /*
   * ... sql_elem
   *   | sql_func
   *   | cds_scalar_func
   *   | sql_arith
   *   | sql_cast
   *   | sql_string
   *   | sql_case
   *   | sql_agg
   *   | sql_win
   *   | sql_null ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPSQL_EXPR.html
  */
  _sql_expression: $ =>
    choice(
      $.sql_host_expression,
      $.sql_host_variable,
      $.sql_column_spec,
      $.literal,
    ),
};
