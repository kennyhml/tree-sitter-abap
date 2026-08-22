module.exports = {
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
};
