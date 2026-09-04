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
      $.sql_null,
      $.sql_function_call,
      $.sql_window_expression,
      alias($._sql_string_expression, $.string_concatenation),
      alias($._sql_arithmetic_expression, $.arithmetic_expression),
      alias($.__sql_parenthesized_expression, $.parenthesized_expression),
    ),

  // https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABENSQL_EXP_PARENTHESES.html
  __sql_parenthesized_expression: $ =>
    prec(5, seq("(", $._sql_expression, ")")),

  // https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABENSQL_NULL.html
  sql_null: _ => prec(1, gen.caseInsensitive("null")),

  /**
   * ... sql_elem1 && sql_elem2  [&& sql_elem3 ... ] ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENSQL_STRING.html
   */
  _sql_string_expression: $ =>
    prec.right(
      seq(
        field("left", $._sql_expression),
        "&&",
        field("right", $._sql_expression),
      ),
    ),

  /**
   * ... [-] sql_exp1 +|-|*|/ [-] sql_exp2 [+|-|*|/ [-] sql_exp3 ... ] ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCOMPUTE_ARITH.html
   */
  _sql_arithmetic_expression: $ =>
    choice($.__sql_binary_operation, $.__sql_unary_operation),

  __sql_binary_operation: $ => {
    // A more limited set of operators is supported
    const ARITHMETIC_OPERATORS = [
      ["+", $ => prec.left(1, $)],
      ["-", $ => prec.left(1, $)],
      ["*", $ => prec.left(2, $)],
      ["/", $ => prec.left(2, $)],
    ];

    return choice(
      ...ARITHMETIC_OPERATORS.map(([op, prec]) =>
        prec(
          seq(
            field("left", $._sql_expression),
            field("operator", op),
            field("right", $._sql_expression),
          ),
        ),
      ),
    );
  },

  __sql_unary_operation: $ =>
    prec(
      4,
      seq(
        field("operator", choice("+", "-")),
        field("value", $._sql_expression),
      ),
    ),

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
    seq(
      "@",
      token.immediate("("),
      field("expression", $._contextual_expression),
      ")",
    ),

  /*
   * ... [data_source|tabalias~]colname
   *   / [data_source|tabalias~]sql_path-element ...
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENABAP_SQL_COLUMNS.html
   */
  sql_column_spec: $ =>
    choice(
      $.qualified_field,
      $.identifier,
      $._sql_contextual_identifier,
      $.sql_path_element,
    ),

  /*
   *... [source~]\_assoc1[sql_para][attributes]
   *            [\_assoc2[sql_para][attributes]]
   *            [\...] ...
   *
   * @see https://help.sap.com/docs/abap-cloud/abap-keyword/abap-sql-sql-path-expressions-sql-path?locale=en-US
   */
  sql_path_element: $ =>
    seq(
      optional(seq(field("source", $.identifier), token.immediate("~"))),
      repeat1($.sql_path_association),
      token.immediate("-"),
      field("component", $._immediate_identifier),
    ),

  sql_path_association: $ =>
    seq(
      "\\",
      field("association", $._immediate_identifier),
      optional($.sql_view_arguments),
      optional($.sql_path_filter),
    ),

  /*
   * ... ( pname1 = act1, pname2 = act2, ... ) ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABENABAP_SQL_PARAMETERS.html
   */
  sql_view_arguments: $ => gen.parenthesized(gen.commaSep1($.view_argument)),

  view_argument: $ =>
    seq(
      field("name", $.identifier),
      "=",
      field(
        "value",
        choice($.sql_host_expression, $.sql_host_variable, $.literal),
      ),
    ),

  /*
   *... [ [[cardinality] [INNER|{LEFT|RIGHT OUTER}]] [[WHERE] sql_cond] ]
   *  | [ [[INNER|{LEFT|RIGHT OUTER}] [cardinality]] [[WHERE] sql_cond] ]...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABENABAP_SQL_PATH_FILTER.html
   */
  sql_path_filter: $ =>
    seq(
      "[",
      choice(
        seq(
          $.sql_association_cardinality,
          optional($.join_kind),
          optional($._sql_path_condition),
        ),
        seq(
          $.join_kind,
          optional($.sql_association_cardinality),
          optional($._sql_path_condition),
        ),
        $._sql_path_condition,
      ),
      "]",
    ),

  _sql_path_condition: $ =>
    seq(
      optional(gen.kw("where")),
      field("condition", $._sql_logical_expression),
    ),

  /*
   * Cardinality Syntax Written in Words
   * ... [ [{{EXACT ONE} | MANY | ONE}] TO {{EXACT ONE} | MANY | ONE} ] ...
   *
   * Numeric Syntax
   * ... [ (1) / (2) / (*) ] ...
   */
  sql_association_cardinality: $ =>
    choice(
      seq(
        optional(field("left", $.cardinality)),
        gen.kw("to"),
        field("right", $.cardinality),
      ),
      seq(
        "(",
        field(
          "right",
          choice(
            alias(token.immediate("1"), $.number),
            alias(token.immediate("2"), $.number),
            token.immediate("*"),
          ),
        ),
        token.immediate(")"),
      ),
    ),

  cardinality: _ =>
    choice(...gen.kws("many", "one"), seq(...gen.kws("exact", "one"))),

  /// ... INNER|{LEFT|RIGHT OUTER} ...
  join_kind: _ =>
    choice(
      gen.kw("inner"),
      seq(...gen.kws("left", "outer")),
      seq(...gen.kws("right", "outer")),
    ),

  _sql_contextual_identifier: $ =>
    alias(
      prec(-1, choice(...gen.caseInsensitive("all", "any", "some", "exists"))),
      $.identifier,
    ),

  qualified_field: $ =>
    seq(
      field("source", choice($.identifier, $.cte_name)),
      token.immediate("~"),
      field("target", $._immediate_identifier),
    ),

  /*
   * ... %_HINTS db @dbhint1
   *              [db @dbhint2 ...] ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABENABAP_SQL_DB_HINTS.html
   */
  sql_database_hints_spec: $ =>
    seq(gen.kw("%_hints"), repeat1($.sql_database_hint)),

  sql_database_hint: $ =>
    seq(
      field("database", $.identifier),
      field(
        "hint",
        choice($.sql_host_variable, $.string_literal, $._reference_operand),
      ),
    ),
};
