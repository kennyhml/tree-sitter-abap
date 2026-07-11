module.exports = {
  /**
   * Because multiple destinations can be specified, this rule should not be reused
   * in places where e.g. a single parameter must be specified.
   *
   * Its also a bit tricky because an assignment can appear in positions where
   * no . must terminate it (e.g reduce).
   *
   * See: https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENVALUE_ASSIGNMENTS.html
   */
  assignment: $ =>
    prec.right(
      seq(
        repeat1(
          seq(
            field("left", $.writable_expression),
            field("operator", choice("=", "?=")),
          ),
        ),
        field("right", $.general_expression),
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
