module.exports = {

  /**
   *
   *  ... rel_exp |
   *      [NOT] log_exp [AND|OR|EQUIV log_exp] ...
   *
   * https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENLOGEXP.html
   */
  _logical_expression: $ => choice(
    $.logical_expression,
    $.relational_expression,
    alias($._parenthesized_logical_expression, $.parenthesized_expression)
  ),

  logical_expression: ($) => {
    // https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENBOOLEAN_OPERATOR_GLOSRY.html
    const BOOLEAN_OPERATORS = [
      [gen.kw("and"), ($) => prec.left(3, $)],
      [gen.kw("or"), ($) => prec.left(2, $)],
      [gen.kw("equiv"), ($) => prec.left(1, $)],
    ];

    return choice(
      prec.right(4, seq(gen.kw("not"), field("negated", $._logical_expression))),
      ...BOOLEAN_OPERATORS.map(([op, p]) =>
        p(seq(
          field("left", $._logical_expression),
          op,
          field("right", $._logical_expression),
        )))
    );
  },

  /**
   * Basic building block of a logical expression.
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENRELATIONAL_EXPRESSION_GLOSRY.html
   */
  relational_expression: ($) => choice($.comparison_expression, $.predicate_expression),

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
  comparison_expression: ($) =>
    seq(
      field("left", $.general_expression),
      choice(
        seq($._comparison_operator, field("right", $.general_expression)),
        field("right", $.between),
        field("right", $.in_table),
      ),
    ),

  in_table: ($) =>
    seq(
      optional(gen.kw("not")),
      gen.kw("in"),
      field("table", $.general_expression),
    ),

  between: ($) =>
    seq(
      optional(gen.kw("not")),
      gen.kw("between"),
      field("low", $.general_expression),
      gen.kw("and"),
      field("high", $.general_expression),
    ),

  predicate_expression: ($) =>
    choice(
      $.initial_predicate,
      $.bound_predicate,
      $.instance_of_predicate,
      $.assigned_predicate,
      $.supplied_predicate,
      $.requested_predicate,
    ),

  // In appropriate positions, this takes precedence over a
  // general expression to wrap the function call in a logical
  // initial predicate, which is what ABAP does implicitly
  initial_predicate: ($) => prec(1,
    choice(
      field("subject", $.function_call),
      seq(
        field("subject", $.general_expression),
        gen.kw("is"),
        optional(gen.kw("not")),
        gen.kw("initial"),
      ),
    )
  ),

  bound_predicate: ($) =>
    seq(
      field("subject", $.general_expression),
      gen.kw("is"),
      optional(gen.kw("not")),
      gen.kw("bound"),
    ),

  instance_of_predicate: ($) =>
    seq(
      field("subject", $.general_expression),
      gen.kw("is"),
      optional(gen.kw("not")),
      gen.kw("instance"),
      gen.kw("of"),
      field("type", $.general_expression),
    ),

  assigned_predicate: ($) =>
    seq(
      field("subject", $.general_expression),
      gen.kw("is"),
      optional(gen.kw("not")),
      gen.kw("assigned"),
    ),

  supplied_predicate: ($) =>
    seq(
      field("subject", $.general_expression),
      gen.kw("is"),
      optional(gen.kw("not")),
      gen.kw("supplied"),
    ),

  requested_predicate: ($) =>
    seq(
      field("subject", $.general_expression),
      gen.kw("is"),
      optional(gen.kw("not")),
      gen.kw("requested"),
    ),

  _comparison_operator: (_) =>
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

  _parenthesized_logical_expression: ($) =>
    prec(5, seq("(", $._logical_expression, ")")),
};
