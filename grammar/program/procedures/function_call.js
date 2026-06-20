module.exports = {

  /**
   * NOTE: This refers to the 'Method Calls'. For reasons that can be read about
   * in `core/builtin/functions` this rule must also cover builtin functions which
   * are syntactically identical on a local level.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENMETHOD_CALLS.html
   */
  function_call: $ => prec.right(5, seq(
    choice(
      // static calls on a class level
      seq(
        field("source", choice($.identifier, $.dynamic_expression)),
        token.immediate("=>"),
        field("name", $._immediate_identifier),
      ),
      // chained to an expression / data object
      seq(
        field("source", choice(
          $.identifier,
          $.function_call,
          $.selector_expression,
          $.new_expression,
          $.cast_expression,
        )),
        choice(token.immediate("->"), token.immediate("~")),
        field("name", $._immediate_identifier),
      ),
      // function call is the root (builtin or local method)
      field("name", $.identifier),
    ),
    $._parenthesized_call_arguments,
  ),
  ),

  /**
   * Covers the long form CALL METHOD statement
   *
   * ... (meth_name)
   *    / oref->(meth_name)
   *    / class=>(meth_name)
   *    / (class_name)=>(meth_name)
   *    / (class_name)=>meth ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCALL_METHOD_METH_IDENT_DYNA.html
   */
  call_method_statement: ($) =>
    seq(
      ...gen.kws("call", "method"),
      field(
        "method",
        choice($.identifier, $.dynamic_expression, $.selector_expression),
      ),
      optional($.call_argument_list),
      ".",
    ),
};
