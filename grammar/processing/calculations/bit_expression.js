module.exports = {
  /**
   *  ... [BIT-NOT] operand1
   *      [{BIT-AND|BIT-OR|BIT-XOR} [BIT-NOT] operand2
   *      [{BIT-AND|BIT-OR|BIT-XOR} [BIT-NOT] operand3
   *      ...  ]] ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCOMPUTE_BIT.html
   */
  bit_expression: $ =>
    choice($.__bitwise_binary_operation, $.__bitwise_unary_operation),

  __bitwise_binary_operation: $ => {
    // @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENBIT_OPERATORS.html
    const BITWISE_OPERATORS = [
      [gen.kw("bit-and"), $ => prec.left(3, $)],
      [gen.kw("bit-xor"), $ => prec.left(2, $)],
      [gen.kw("bit-or"), $ => prec.left(1, $)],
    ];

    return choice(
      ...BITWISE_OPERATORS.map(([op, prec]) =>
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

  __bitwise_unary_operation: $ =>
    prec(
      4,
      seq(
        field("operator", gen.kw("bit-not")),
        field("value", $.general_expression),
      ),
    ),
};
