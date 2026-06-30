module.exports = {
  /**
   * ... operand1 && operand2 ...
   *
   * For ABAP, this simply falls under a 'string expression' so Im hesitant to
   * call it a `concatenation_expression`...
   *
   *  @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENSTRING_OPERATORS.html
   */
  string_concatenation: ($) =>
    prec.left(
      seq(
        field("left", $.character_like_expression),
        "&&",
        field("right", $.character_like_expression),
      ),
    ),
};
