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
            field("left", $._assignment_target),
            field("operator", choice("=", "?=")),
          ),
        ),
        field("right", $.expression),
        optional("."),
      ),
    ),

  calculation_assignment: $ =>
    prec.right(
      seq(
        field("left", $._assignment_target),
        field("operator", choice("+=", "-=", "*=", "/=", "&&=")),
        field("right", $.expression),
        optional("."),
      ),
    ),

  _assignment_target: $ =>
    choice(
      prec(
        99,
        choice(
          $.identifier,
          $._contextual_identifier,
          $.field_symbol,
          $.component_selection,
          $.table_body_access,
          $.dereference_expression,
          $.substring_access,
        ),
      ),
      $.new_expression,
      $.cast_expression,
      $.table_expression,
      $.declaration_expression,
    ),
};
