module.exports = {
  /**
   * FOR TABLE FUNCTION cds_tabfunc.
   * 
   * @see {@link https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS-METHODS_FOR_TABFUNC.html}
   */
  for_table_function: $ => seq(
    ...gen.kws("for", "table", "function"),
    field("name", $.identifier)
  ),

  /**
   * FOR SCALAR FUNCTION cds_scalar_func.
   * 
   * @see {@link https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS-METHODS_FOR_SCALFUNC.html}
   */
  for_scalar_function: $ => seq(
    ...gen.kws("for", "scalar", "function"),
    field("name", $.identifier),
  ),

  /**
   * FOR SQL SERVICE ...
   * 
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS-METHODS_FOR_SQL_SERVICE.html
   */
  for_sql_service: _ => seq(
    ...gen.kws("for", "sql", "service"),
  ),


  /**
   * AMDP OPTIONS [READ-ONLY] 
   *              [client_handling] ...
   * 
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHODS_AMDP_OPTIONS.html 
   */
  amdp_options: $ => seq(
    ...gen.kws("amdp", "options"),
    repeat1(choice(
      $.read_only,
      $.__amdp_client_handling_spec
    ))
  ),

  /**
   * AMDP OPTIONS [CDS SESSION CLIENT CURRENT|clnt]
   * ...
   * {CDS SESSION CLIENT DEPENDENT} | {CLIENT INDEPENDENT}
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHODS_AMDP_OPTIONS_CLIENT.html
   */
  __amdp_client_handling_spec: $ => choice(
    $.cds_session_client_dependent,
    $.client_independent,
    $.cds_session_client
  ),

  cds_session_client: $ => seq(
    ...gen.kws("cds", "session", "client"),
    field("name", choice(
      $.current,
      $.identifier,
    ))
  ),

  cds_session_client_dependent: _ => seq(
    ...gen.kws("cds", "session", "client", "dependent")
  ),

  client_independent: _ => seq(
    ...gen.kws("client", "independent")
  ),

  current: _ => gen.kw("current"),

}
