module.exports = {

  /**
   * An expression in which a component is selected.
   *
   * The ABAP keyword docs call this a 'component selector' operator.
   *
   * The result is a composite operand which is valid in any position
   * where an elementary operand is valid.
   * 
   * In favor of simplicity, state count and readability, it appears better
   * to parse them as one rule with the only difference being the operator.
   *
   * More specifically, this covers:
   * - Structure Component Selectors (including dynamic ones)
   * - Object Component Selectors
   * - Class Component Selectors
   * - Interface Component Selectors
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENSTRUCTURE_COMPONENT_SELECTOR.html
   */
  selector_expression: $ => seq(
    field("subject",
      choice(
        $.identifier,
        $.field_symbol,
        $.selector_expression,
        $.function_call,
        $.table_expression,
        $.new_expression,
        $.cast_expression,
        $.dynamic_expression
      )
    ),
    field("selector", choice(
      token.immediate("-"),
      token.immediate("->"),
      token.immediate("=>"),
      token.immediate("~"),
    )),
    field("component",
      choice(
        $.dynamic_expression,
        $._immediate_identifier
      )
    )
  ),
}

