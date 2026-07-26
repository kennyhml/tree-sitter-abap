module.exports = {
  /*
   * BY DATABASE PROCEDURE|FUNCTION|{GRAPH WORKSPACE}
   *        FOR db
   *        LANGUAGE db_lang
   *        [OPTIONS db_options]
   *        [USING   entities]
   *        [USING   SCHEMA schema1 OBJECTS db_entities]
   *        [USING   SCHEMA schema2 OBJECTS db_entities]
   *        ... .
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPMETHOD_BY_DB_PROC.html
   */
  by_database_spec: $ =>
    seq(
      ...gen.kws("by", "database"),
      field(
        "implementation",
        choice($.function, $.procedure, $.graph_workspace),
      ),
      repeat(
        choice(
          $.db_system_spec,
          $.db_language_spec,
          $.db_options_spec,
          $.using_entities_spec,
          $.using_schema_spec,
        ),
      ),
    ),

  // FOR db, only HDB atm
  db_system_spec: $ => seq(gen.kw("for"), field("database", $.identifier)),

  // LANGUAGE db_lang - e.g SQL, SQLSCRIPT, GRAPH
  db_language_spec: $ =>
    seq(gen.kw("language"), field("language", $.identifier)),

  // LANGUAGE db_lang - e.g SQL, SQLSCRIPT, GRAPH
  db_options_spec: $ =>
    seq(
      gen.kw("options"),
      repeat1(choice($.read_only, $.deterministic, $.suppress_syntax_errors)),
    ),

  /* ... USING entities ..
   *
   * Can specify cds entities, database tables or other amdp managed procedures
   */
  using_entities_spec: $ =>
    seq(gen.kw("using"), repeat1(choice($.component_selection, $.identifier))),

  /* ... USING SCHEMA schema OBJECTS objects ..
   */
  using_schema_spec: $ =>
    seq(
      ...gen.kws("using", "schema"),
      field("schema", $.identifier),
      $.schema_objects_spec,
    ),

  schema_objects_spec: $ => seq(gen.kw("objects"), repeat1($.identifier)),

  /**
   * FOR TABLE FUNCTION cds_tabfunc.
   *
   * @see {@link https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS-METHODS_FOR_TABFUNC.html}
   */
  for_table_function_spec: $ =>
    seq(...gen.kws("for", "table", "function"), field("name", $.identifier)),

  /**
   * FOR SCALAR FUNCTION cds_scalar_func.
   *
   * @see {@link https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS-METHODS_FOR_SCALFUNC.html}
   */
  for_scalar_function_spec: $ =>
    seq(...gen.kws("for", "scalar", "function"), field("name", $.identifier)),

  /**
   * FOR DDL OBJECT [OPTIONS {CDS SESSION CLIENT DEPENDENT|REQUIRED}
   *                      | {CLIENT INDEPENDENT}].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS-METHODS_FOR_DDL_OBJECT.html
   */
  for_ddl_object_spec: $ =>
    seq(
      ...gen.kws("for", "ddl", "object"),
      optional(alias($.__ddl_object_options_spec, $.amdp_options_spec)),
    ),

  /**
   * FOR SQL SERVICE ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS-METHODS_FOR_SQL_SERVICE.html
   */
  for_sql_service_spec: _ => seq(...gen.kws("for", "sql", "service")),

  /**
   * AMDP OPTIONS [READ-ONLY]
   *              [client_handling] ...
   *
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHODS_AMDP_OPTIONS.html
   */
  amdp_options_spec: $ =>
    seq(
      ...gen.kws("amdp", "options"),
      repeat1(choice($.read_only, $.__amdp_client_handling_spec)),
    ),

  /*
   * [OPTIONS {CDS SESSION CLIENT DEPENDENT|REQUIRED}
   *                      | {CLIENT INDEPENDENT}].
   */
  __ddl_object_options_spec: $ =>
    seq(
      gen.kw("options"),
      choice($.cds_session_client_spec, $.client_independent),
    ),

  /**
   * AMDP OPTIONS [CDS SESSION CLIENT CURRENT|clnt]
   * ...
   * {CDS SESSION CLIENT DEPENDENT} | {CLIENT INDEPENDENT}
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHODS_AMDP_OPTIONS_CLIENT.html
   */
  __amdp_client_handling_spec: $ =>
    choice($.cds_session_client_spec, $.client_independent),

  cds_session_client_spec: $ =>
    seq(
      ...gen.kws("cds", "session", "client"),
      field(
        "name",
        choice($.current, $.identifier, $.dependent, $.independent, $.required),
      ),
    ),

  dependent: _ => gen.kw("dependent"),

  independent: _ => gen.kw("independent"),

  required: _ => gen.kw("required"),

  client_independent: _ => seq(...gen.kws("client", "independent")),

  current: _ => gen.kw("current"),

  procedure: _ => gen.kw("procedure"),

  function: _ => gen.kw("function"),

  deterministic: _ => gen.kw("deterministic"),

  suppress_syntax_errors: _ => seq(...gen.kws("suppress", "syntax", "errors")),

  graph_workspace: _ => seq(...gen.kws("graph", "workspace")),
};
