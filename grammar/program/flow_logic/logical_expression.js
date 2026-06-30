module.exports = {
  /**
   *
   *  ... rel_exp |
   *      [NOT] log_exp [AND|OR|EQUIV log_exp] ...
   *
   * https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENLOGEXP.html
   */
  logical_expression: ($) => {
    // https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENBOOLEAN_OPERATOR_GLOSRY.html
    const BOOLEAN_OPERATORS = [
      [gen.kw("and"), ($) => prec.left(3, $)],
      [gen.kw("or"), ($) => prec.left(2, $)],
      [gen.kw("equiv"), ($) => prec.left(1, $)],
    ];

    return choice(
      $.relational_expression,
      prec.right(4, seq(gen.kw("not"), $.logical_expression)),
      ...BOOLEAN_OPERATORS.map(([op, prec]) =>
        prec(seq(op, $.logical_expression)),
      ),
    );
  },

  /**
   * Basic building block of a logical expression.
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENRELATIONAL_EXPRESSION_GLOSRY.html
   */
  relational_expression: ($) =>
    prec(
      1,
      choice($.comparison_expression, $.predicate_expression, $.function_call),
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
    ),

  initial_predicate: ($) =>
    seq(
      field("subject", $.general_expression),
      gen.kw("is"),
      optional(gen.kw("not")),
      gen.kw("initial"),
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
};
