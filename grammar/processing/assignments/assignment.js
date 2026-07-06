module.exports = {
  /**
   * Because multiple destinations can be specified, this rule should not be reused
   * in places where e.g. a single parameter must be specified.
   *
   * See: https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENVALUE_ASSIGNMENTS.html
   */
  assignment: $ =>
    prec.right(
      seq(
        field("left", $.writable_expression),
        field("operator", "="),
        field("right", choice($.general_expression, $.assignment)),
        optional("."),
      ),
    ),

  calculation_assignment: $ =>
    prec.right(
      seq(
        field("left", $.writable_expression),
        field("operator", choice("+=", "-=", "*=", "/=", "&&=")),
        field("right", $.general_expression),
        optional("."),
      ),
    ),
};
