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
      optional(
        seq(field("source", $.identifier), token.immediate("~")),
      ),
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
      field("value", choice($.sql_host_expression, $.sql_host_variable)),
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
   * ... [ {{EXACT ONE} | MANY | ONE} TO {{EXACT ONE} | MANY | ONE} ] ...
   *
   * Numeric Syntax
   * ... [ (1) / (2) / (*) ] ...
   */
  sql_association_cardinality: $ =>
    choice(
      seq(
        field("left", $.cardinality),
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
};
