/*
 * ... col
 *   | literal
 *   | @dobj
 *   | @( expr ) ...
 *
 * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENSQL_OPERANDS.html
 */
module.exports = {
  /* A variable from the surrounding ABAP context
   *
   *
   * ... @dref->* ...
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENABAP_SQL_HOST_VARIABLES.html
   */
  sql_host_variable: $ => seq("@", field("variable", $._result_target)),

  /* An expression from the surrounding ABAP context
   *
   * ... @( expr ) ...
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/abenabap_sql_host_expressions.html
   */
  sql_host_expression: $ =>
    seq("@", token.immediate("("), field("expression", $.expression), ")"),

  /*
   * ... [data_source|tabalias~]colname
   *   / [data_source|tabalias~]sql_path-element ...
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENABAP_SQL_COLUMNS.html
   */
  sql_column_spec: $ => choice(),
};
