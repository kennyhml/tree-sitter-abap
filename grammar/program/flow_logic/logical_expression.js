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

const makeComparisonExpr = ($, rule) =>
  seq(
    field("left", rule),
    choice(
      seq($._comparison_operator, field("right", $.general_expression)),
      field("right", $.between),
      field("right", $.in_table),
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
      $._relational_expression,
      alias($._parenthesized_logical_expression, $.parenthesized_expression),
    ),

  // A mirror of the logical expression chain for member expressions
  _member_logical_expression: $ =>
    choice(
      alias($.__member_logical_expr, $.logical_expression),
      $._member_relational_expression,
      alias(
        $._member_parenthesized_logical_expression,
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
  _relational_expression: $ =>
    choice($.comparison_expression, $._predicate_expression),

  /**
   * Basic building block of a logical expression.
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENRELATIONAL_EXPRESSION_GLOSRY.html
   */
  _member_relational_expression: $ =>
    choice(
      alias($._member_comparison_expression, $.comparison_expression),
      $._member_predicate_expression,
    ),

  /**
   * Comparison of two or more subjects represented as {@link general_expression}.
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
  comparison_expression: $ => makeComparisonExpr($, $.general_expression),
  _member_comparison_expression: $ => makeComparisonExpr($, $.itab_comp),

  in_table: $ =>
    seq(
      optional(gen.kw("not")),
      gen.kw("in"),
      field("table", $.general_expression),
    ),

  between: $ =>
    seq(
      optional(gen.kw("not")),
      gen.kw("between"),
      field("low", $.general_expression),
      gen.kw("and"),
      field("high", $.general_expression),
    ),

  _predicate_expression: $ =>
    choice(
      $.initial_predicate,
      $.bound_predicate,
      $.instance_of_predicate,
      $.assigned_predicate,
      $.supplied_predicate,
      $.requested_predicate,
    ),

  // Only a small set is possible here
  _member_predicate_expression: $ =>
    choice(
      alias($._member_initial_predicate, $.initial_predicate),
      alias($._member_bound_predicate, $.bound_predicate),
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
          field("subject", $.general_expression),
          gen.kw("is"),
          optional(gen.kw("not")),
          gen.kw("initial"),
        ),
      ),
    ),

  _member_initial_predicate: $ =>
    seq(
      field("subject", $.itab_comp),
      gen.kw("is"),
      optional(gen.kw("not")),
      gen.kw("initial"),
    ),

  bound_predicate: $ =>
    seq(
      field("subject", $.general_expression),
      gen.kw("is"),
      optional(gen.kw("not")),
      gen.kw("bound"),
    ),

  _member_bound_predicate: $ =>
    seq(
      field("subject", $.itab_comp),
      gen.kw("is"),
      optional(gen.kw("not")),
      gen.kw("bound"),
    ),

  instance_of_predicate: $ =>
    seq(
      field("subject", $.general_expression),
      gen.kw("is"),
      optional(gen.kw("not")),
      gen.kw("instance"),
      gen.kw("of"),
      field("type", $.general_expression),
    ),

  assigned_predicate: $ =>
    seq(
      field("subject", $.general_expression),
      gen.kw("is"),
      optional(gen.kw("not")),
      gen.kw("assigned"),
    ),

  supplied_predicate: $ =>
    seq(
      field("subject", $.general_expression),
      gen.kw("is"),
      optional(gen.kw("not")),
      gen.kw("supplied"),
    ),

  requested_predicate: $ =>
    seq(
      field("subject", $.general_expression),
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

  _parenthesized_logical_expression: $ =>
    prec(5, seq("(", $._logical_expression, ")")),

  _member_parenthesized_logical_expression: $ =>
    prec(5, seq("(", $._member_logical_expression, ")")),
};
