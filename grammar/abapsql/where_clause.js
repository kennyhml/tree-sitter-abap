module.exports = {
  /**
   * ... { { operand1 {=|EQ|<>|NE|>|GT|<|LT|>=|GE|<=|LE}
   *                   { operand2
   *                   | {[ALL|ANY|SOME]
   *                      (SELECT subquery_clauses
   *                       [UNION|INTERSECT|EXCEPT ...])} } }
   *     | { operand [NOT] BETWEEN operand1 AND operand2 }
   *     | { operand1 [NOT] LIKE operand2 [ESCAPE esc] }
   *     | { operand IS [NOT] NULL }
   *     | { operand IS [NOT] INITIAL }
   *     | { EXISTS
   *         (SELECT subquery_clauses
   *          [UNION|INTERSECT|EXCEPT ...]) }
   *     | { operand [NOT] IN (operand1, operand2, ...) }
   *     | { operand [NOT] IN
   *         (SELECT subquery_clauses
   *          [UNION|INTERSECT|EXCEPT ...]) }
   *     | { (operand1, operand2, ...)
   *         IN ((operand11, operand21, ...),
   *             (operand12, operand22, ...), ...) }
   *     | { operand [NOT] IN @range_tab }
   *     | { (cond_syntax) } } ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPWHERE.html
   */
  _sql_where_condition_spec: $ =>
    alias($.__sql_where_condition_spec, $.where_condition_spec),

  __sql_where_condition_spec: $ =>
    seq(gen.kw("where"), field("condition", $._sql_logical_expression)),

  // A local copy of the logical expression rule for sql expressions.
  _sql_logical_expression: $ =>
    choice(
      alias($.__sql_logical_expression, $.logical_expression),
      alias($.__sql_comparison_expression, $.comparison_expression),
      alias(
        $.__sql_operand_list_comparison_expression,
        $.comparison_expression,
      ),
      alias(
        $.__sql_parenthesized_logical_expression,
        $.parenthesized_expression,
      ),
      $.dynamic_spec,
      $.sql_exists_spec,
    ),

  // A local copy of the logical expression core for logical expressions
  __sql_logical_expression: $ =>
    choice(
      prec.right(
        3,
        seq(gen.kw("not"), field("negated", $._sql_logical_expression)),
      ),
      prec.left(
        2,
        seq(
          field("left", $._sql_logical_expression),
          gen.kw("and"),
          field("right", $._sql_logical_expression),
        ),
      ),
      prec.left(
        1,
        seq(
          field("left", $._sql_logical_expression),
          gen.kw("or"),
          field("right", $._sql_logical_expression),
        ),
      ),
    ),

  __sql_parenthesized_logical_expression: $ =>
    prec(4, gen.parenthesized($._sql_logical_expression)),

  /*
   * ... { {operand1 {=|EQ|<>|NE|>|GT|<|LT|>=|GE|<=|LE} operand2}
   *     | {operand  [NOT] BETWEEN operand1 AND operand2}
   *     | {operand1 [NOT] LIKE operand2 [ESCAPE esc]}
   *     | {operand  IS [NOT] NULL}
   *     | {operand  IS [NOT] INITIAL} } ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABENABAP_SQL_EXPR_LOGEXP.html
   */
  __sql_comparison_expression: $ =>
    seq(
      field("left", $._sql_expression),
      choice(
        seq($._sql_comparison_operator, field("right", $._sql_expression)),
        // ... > [ALL|ANY|SOME] ( SELECT ... )
        seq(
          $._sql_comparison_operator,
          optional(field("quantifier", $.sql_comparison_quantifier)),
          gen.parenthesized(field("right", $.sql_subquery)),
        ),
        field("right", $.sql_between_spec),
        field("right", $.sql_like_spec),
        field("right", $.sql_null_spec),
        field("right", $.sql_initial_spec),
        field("right", $.sql_in_spec),
      ),
    ),

  __sql_operand_list_comparison_expression: $ =>
    seq(
      field("left", $.sql_operand_list),
      field("right", $.sql_operand_list_in_spec),
    ),

  sql_between_spec: $ =>
    seq(
      optional(gen.kw("not")),
      gen.kw("between"),
      field("low", $._sql_expression),
      gen.kw("and"),
      field("high", $._sql_expression),
    ),

  sql_comparison_quantifier: _ => choice(...gen.kws("all", "any", "some")),

  sql_like_spec: $ =>
    seq(
      optional(gen.kw("not")),
      gen.kw("like"),
      field("pattern", $._sql_expression),
      optional(seq(gen.kw("escape"), field("escape", $._sql_expression))),
    ),

  sql_null_spec: _ =>
    seq(gen.kw("is"), optional(gen.kw("not")), gen.kw("null")),

  sql_initial_spec: _ =>
    seq(gen.kw("is"), optional(gen.kw("not")), gen.kw("initial")),

  /*
   * ... {operand [NOT] IN (operand1, operand2 ...)}
   *   | {operand [NOT] IN ( SELECT subquery_clauses [UNION|INTERSECT|EXCEPT ...] )}
   *   | {( operand1, operand2, ... ) IN ( ( operand11, operand21 ... ),
   *                                       ( operand12, operand22 ... ), ... )}
   *   | {operand [NOT] IN @range_tab}
   */
  sql_in_spec: $ =>
    seq(
      optional(gen.kw("not")),
      gen.kw("in"),
      choice($.sql_host_variable, $.sql_in_list),
    ),

  // ... IN (@foo, @bar) / ( SELECT subquery ) ...
  sql_in_list: $ =>
    gen.parenthesized(choice(gen.commaSep1($._sql_expression), $.sql_subquery)),

  // ... EXISTS ( SELECT subquery_clauses [UNION|INTERSECT|EXCEPT) ...
  sql_exists_spec: $ =>
    seq(gen.kw("exists"), gen.parenthesized($.sql_subquery)),

  sql_operand_list: $ =>
    gen.parenthesized(
      seq(
        choice($._immediate_identifier, $._sql_expression),
        repeat1(seq(",", $._sql_expression)),
      ),
    ),

  sql_operand_list_in_spec: $ =>
    seq(
      gen.kw("in"),
      gen.parenthesized(
        choice(
          gen.commaSep1($.sql_operand_list),
          gen.commaSep1($._sql_expression),
          $.sql_subquery,
        ),
      ),
    ),

  _sql_comparison_operator: _ =>
    choice(
      ...gen.kws("eq", "ne", "gt", "lt", "ge", "le"),
      "=",
      "<>",
      ">",
      "<",
      ">=",
      "<=",
    ),
};
