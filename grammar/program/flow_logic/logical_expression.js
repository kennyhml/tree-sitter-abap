/**
 * Things can get tricky here because by nature, logical expressions can be
 * deeply nested. That makes querying identifiers in some context, e.g
 * a where clause, to be member vareables, extremely difficult.
 *
 * It may be better to generate two sets of identical rules here, swapping out
 * the general expressions on the lhs for itab member specefications.
 */

// https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENBOOLEAN_OPERATOR_GLOSRY.html

const makeLogicalExpr = rule => {
  const BOOLEAN_OPERATORS = [
    [gen.kw("and"), $ => prec.left(3, $)],
    [gen.kw("or"), $ => prec.left(2, $)],
    [gen.kw("equiv"), $ => prec.left(1, $)],
  ];
  return choice(
    prec.right(4, seq(gen.kw("not"), field("negated", rule))),
    ...BOOLEAN_OPERATORS.map(([op, p]) =>
      p(seq(field("left", rule), op, field("right", rule))),
    ),
  );
};

const makeComparisonExpr = ($, leftRule, rightRule) =>
  seq(
    field("left", leftRule),
    choice(
      seq($._comparison_operator, field("right", rightRule)),
      field("right", $.between_spec),
      field("right", $.in_table_spec),
    ),
  );

module.exports = {
  /**
   *
   *  ... rel_exp |
   *      [NOT] log_exp [AND|OR|EQUIV log_exp] ...
   *
   * https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENLOGEXP.html
   */
  _logical_expression: $ =>
    choice(
      $.logical_expression,
      $.__relational_expression,
      alias($.__parenthesized_logical_expression, $.parenthesized_expression),
    ),

  // A mirror of the logical expression chain for member expressions
  _member_logical_expression: $ =>
    choice(
      alias($.__member_logical_expr, $.logical_expression),
      $.__member_relational_expression,
      alias(
        $.__member_parenthesized_logical_expression,
        $.parenthesized_expression,
      ),
    ),

  logical_expression: $ => makeLogicalExpr($._logical_expression),

  __member_logical_expr: $ => makeLogicalExpr($._member_logical_expression),

  /**
   * Basic building block of a logical expression.
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENRELATIONAL_EXPRESSION_GLOSRY.html
   */
  __relational_expression: $ =>
    choice($.comparison_expression, $.__predicate_expression),

  /**
   * Basic building block of a logical expression.
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENRELATIONAL_EXPRESSION_GLOSRY.html
   */
  __member_relational_expression: $ =>
    choice(
      alias($.__member_comparison_expression, $.comparison_expression),
      $.__member_predicate_expression,
    ),

  /**
   * Comparison of two or more subjects represented as {@link expression}.
   *... { subject1
   *      {=|EQ|<>|NE|>|GT|<|LT|>=|GE|<=|LE}
   *      | {CO|CN|CA|NA|CS|NS|CP|NP}
   *      | {BYTE-CO|BYTE-CN|BYTE-CA|BYTE-NA|BYTE-CS|BYTE-NS}
   *      | {O|Z|M} subject2 }
   *
   *    | { subject [NOT] BETWEEN operand1 AND operand2 }
   *    | { subject [NOT] IN range_tab}  ...
   *
   *
   * https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENLOGEXP_COMP.html
   */
  comparison_expression: $ =>
    makeComparisonExpr($, $.expression, $.expression),
  __member_comparison_expression: $ =>
    makeComparisonExpr($, $.itab_comp, $._contextual_expression),

  in_table_spec: $ =>
    seq(
      optional(gen.kw("not")),
      gen.kw("in"),
      field("table", $.expression),
    ),

  between_spec: $ =>
    seq(
      optional(gen.kw("not")),
      gen.kw("between"),
      field("low", $.expression),
      gen.kw("and"),
      field("high", $.expression),
    ),

  __predicate_expression: $ =>
    choice(
      $.initial_predicate,
      $.bound_predicate,
      $.instance_of_predicate,
      $.assigned_predicate,
      $.supplied_predicate,
      $.requested_predicate,
    ),

  // Only a small set is possible here
  __member_predicate_expression: $ =>
    choice(
      alias($.__member_initial_predicate, $.initial_predicate),
      alias($.__member_bound_predicate, $.bound_predicate),
    ),

  // In appropriate positions, this takes precedence over a
  // general expression to wrap the function call in a logical
  // initial predicate, which is what ABAP does implicitly
  initial_predicate: $ =>
    prec(
      1,
      choice(
        field("subject", $.function_call),
        seq(
          field("subject", $.expression),
          gen.kw("is"),
          optional(gen.kw("not")),
          gen.kw("initial"),
        ),
      ),
    ),

  __member_initial_predicate: $ =>
    seq(
      field("subject", $.itab_comp),
      gen.kw("is"),
      optional(gen.kw("not")),
      gen.kw("initial"),
    ),

  bound_predicate: $ =>
    seq(
      field("subject", $.expression),
      gen.kw("is"),
      optional(gen.kw("not")),
      gen.kw("bound"),
    ),

  __member_bound_predicate: $ =>
    seq(
      field("subject", $.itab_comp),
      gen.kw("is"),
      optional(gen.kw("not")),
      gen.kw("bound"),
    ),

  instance_of_predicate: $ =>
    seq(
      field("subject", $.expression),
      gen.kw("is"),
      optional(gen.kw("not")),
      gen.kw("instance"),
      gen.kw("of"),
      field("type", $.expression),
    ),

  assigned_predicate: $ =>
    seq(
      field("subject", $.expression),
      gen.kw("is"),
      optional(gen.kw("not")),
      gen.kw("assigned"),
    ),

  supplied_predicate: $ =>
    seq(
      field("subject", $._contextual_expression),
      gen.kw("is"),
      optional(gen.kw("not")),
      gen.kw("supplied"),
    ),

  requested_predicate: $ =>
    seq(
      field("subject", $._contextual_expression),
      gen.kw("is"),
      optional(gen.kw("not")),
      gen.kw("requested"),
    ),

  _comparison_operator: _ =>
    choice(
      ...gen.kws(
        "eq",
        "ne",
        "gt",
        "lt",
        "ge",
        "le",
        "co",
        "cn",
        "ca",
        "na",
        "cs",
        "ns",
        "cp",
        "np",
        "byte-co",
        "byte-cn",
        "byte-ca",
        "byte-na",
        "byte-cs",
        "byte-ns",
        "o",
        "z",
        "m",
      ),
      "=",
      "<>",
      ">",
      "<",
      ">=",
      "<=",
    ),

  __parenthesized_logical_expression: $ =>
    prec(5, seq("(", $._logical_expression, ")")),

  __member_parenthesized_logical_expression: $ =>
    prec(5, seq("(", $._member_logical_expression, ")")),
};
