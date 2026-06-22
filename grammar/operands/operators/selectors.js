module.exports = {

  /**
   * ABAPs call this a 'component selector' operation.
   *
   * It does not seem to consider these 'expressions' at all - which is
   * frankly a little bit confusing. Because at the same time, it can be nested
   * inside expressions. It states pretty clearly that e.g a {@link chained_identifier}
   * is not an expression but a 'single operand' instead.
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
   * Critically, operands may entirely consist of component selections.
   * In that case, they form a {@link chained_identifier} instead of using
   * this component selection rule.
   *
   * In other words, this rule is used stricly for interconnected components
   * inside other sorts of chainings (table expressions, method calls..)
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENSTRUCTURE_COMPONENT_SELECTOR.html
   */
  component_selection: $ => seq(
    field("subject",
      choice(
        $.identifier,
        $.field_symbol,
        $.component_selection,
        $.function_call,
        $.table_expression,
        $.new_expression,
        $.cast_expression,
        $.dynamic_spec
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
        $.dynamic_spec,
        $._immediate_identifier
      )
    )
  ),
}


const in_consideration = {

  /**
   * Based on the ABAP spec, identifiers 'constructed from multiple names separated
   * by component selectors' are NOT expressions but single (or composite?) operands
   * Basically, any chaining that must evaluate to a constant expression.
   *
   * Currently, this extra rule provides no value. It could narrow down possible valid
   * syntax in certain position, but the grammar is desiged to be permissive. At the same
   * time, it creates the exact same challenges in terms of querying the recursive structure.
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENCHAINED_NAME_GLOSRY.html
   */
  chained_identifier: $ => alias($._elementary_component_selection, $.component_selection),

  _elementary_component_selection: $ => seq(
    field("subject",
      choice(
        $.identifier,
        alias($._elementary_component_selection, $.component_selection),
      )
    ),
    field("selector", choice(
      token.immediate("-"),
      token.immediate("->"),
      token.immediate("=>"),
      token.immediate("~"),
    )),
    field("component", $._immediate_identifier)
  ),
}
