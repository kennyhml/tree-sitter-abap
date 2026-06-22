module.exports = {

  /**
   * Handles a dereference expression using the dereferencing operator ->*.
   *
   * Example:
   * `dref->*`
   *
   * While listed under 'Notations for single operands', the explanation actually states
   * that 'the expression dref->* can be specified at any operand position' which effectivly
   * confirms that it is an expression.
   * 
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENDEREFERENCING_OPERATOR.html
   */
  dereference_expression: $ => seq(
    field("subject",
      choice(
        $.identifier,
        $.component_selection,
        $.function_call,
        $.new_expression,
        $.table_expression,
        $.cast_expression
      )
    ),
    token.immediate("->*"),
  ),

}
