module.exports = {
  /**
   *... [+|-] operand1
   *   [{+|-|*|/|DIV|MOD|**} [+|-] operand2
   *   [{+|-|*|/|DIV|MOD|**} [+|-] operand3 ... ]]
   *   ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCOMPUTE_ARITH.html
   */
  arithmetic_expression: ($) => choice($._binary_operation, $._unary_operation),

  _binary_operation: ($) => {
    // Arithmetic operator precedences
    // @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENARITH_OPERATORS.html
    const ARITHMETIC_OPERATORS = [
      ["+", ($) => prec.left(1, $)],
      ["-", ($) => prec.left(1, $)],
      ["*", ($) => prec.left(2, $)],
      ["/", ($) => prec.left(2, $)],
      ["**", ($) => prec.right(3, $)],
      [gen.kw("div"), ($) => prec.left(2, $)],
      [gen.kw("mod"), ($) => prec.left(2, $)],
    ];

    return choice(
      ...ARITHMETIC_OPERATORS.map(([op, prec]) =>
        prec(
          seq(
            field("left", $.general_expression),
            field("operator", op),
            field("right", $.general_expression),
          ),
        ),
      ),
    );
  },

  _unary_operation: ($) =>
    prec(
      4,
      seq(
        field("operator", choice("+", "-")),
        field("value", $.general_expression),
      ),
    ),
};
