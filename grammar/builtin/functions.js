const disabled = {
  /**
   * Syntax Forms:
   *
   * Functions with an Unnamed Parameter
   *  1. ... func( arg ) ...
   *
   * Functions with Named Parameters
   *  2. ... func( val = arg p1 = arg1 p2 = arg2 ... ) ...
   *
   * WARN: This rule is disabled for now as it left us two choices:
   * 1. Use a generic identifier for the name - causes ambiguity with local method calls
   * 2. Check the set of builtin function names - doubles the parser size due to state explosion
   *
   * Could not find a way to get around the second option screwing the state count.
   *
   * Better to use a generic `function_call` that covers both, then check the name via query.
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/latest/en-US/ABENBUILT_IN_FUNCTIONS_SYNTAX.html
   */
  function_call: $ =>
    seq(
      field("name", alias($._builtin_function_identifier, $.identifier)),
      $._parenthesized_call_arguments,
    ),
};
