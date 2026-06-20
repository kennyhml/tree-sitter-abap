module.exports = {

  /**
   *
   * Handles a dereference expression using the dereferencing operator ->*.
   *
   * Example:
   * `dref->*`
   * 
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENDEREFERENCING_OPERATOR.html
   */
  dereference_expression: $ => seq(
    field("subject",
      choice(
        $.identifier,
        $.selector_expression,
        $.function_call,
        $.new_expression,
        $.table_expression,
        $.cast_expression
      )
    ),
    token.immediate("->*"),
  ),

}
