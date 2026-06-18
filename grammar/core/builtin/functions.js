module.exports = {

  /**
   * Syntax Forms:
   *
   * Functions with an Unnamed Parameter
   *  1. ... func( arg ) ...
   *
   * Functions with Named Parameters
   *  2. ... func( val = arg p1 = arg1 p2 = arg2 ... ) ...
   *
   * WARN: It might seem appealing not hard-coding a set of builtin functions.
   * However, this would actually cause ambiguity in the local scope of class
   * methods as method names could appear immediately.
   *
   * The real question at that point then becomes, do we even need this to
   * begin with or are we happy with just a single `function_call` node.
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/latest/en-US/ABENBUILT_IN_FUNCTIONS_SYNTAX.html
   */
  builtin_function_call: $ => seq(
    field("name", alias($._builtin_function_identifier, $.identifier)),
    $._parenthesized_call_arguments
  ),

  // From https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENBUILT_IN_FUNCTIONS_OVERVIEW.html
  _builtin_function_identifier: _ => prec(-1, choice(
    ...gen.caseInsensitive(
      // Logical Functions
      'boolc', 'boolx', 'xsdbool',
      'contains', 'contains_any_of', 'contains_any_not_of',
      'matches',
      'line_exists',

      // Numeric Functions
      'abs', 'ceil', 'floor', 'frac', 'sign', 'trunc',
      'ipow',
      'nmax', 'nmin',
      'acos', 'asin', 'atan', 'cos', 'sin', 'tan', 'cosh', 'sinh', 'tanh', 'exp', 'log', 'log10', 'sqrt',
      'round', 'rescale',
      'gamma', 'log_gamma', 'gamma_lower',
      'factorial', 'binomial',
      'erf', 'erfc', 'erf_inv', 'erfc_inv',

      // Character String Functions
      'charlen', 'dbmaxlen', 'numofchar', 'strlen',
      'char_off',
      'cmax', 'cmin',
      'count', 'count_any_of', 'count_any_not_of',
      'distance',
      'condense',
      'concat_lines_of',
      'escape',
      'find', 'find_end', 'find_any_of', 'find_any_not_of',
      'insert',
      'match',
      'repeat',
      'replace',
      'reverse',
      'segment',
      'shift_left', 'shift_right',
      'substring', 'substring_after', 'substring_from', 'substring_before', 'substring_to',
      'to_upper', 'to_lower', 'to_mixed', 'from_mixed',
      'translate',

      // Byte Chain Functions
      'xstrlen',
      'bit-set',

      // Time Stamp Functions
      'utclong_current', 'utclong_add', 'utclong_diff',

      // Functions for Internal Tables
      'lines', 'line_index'
    )
  ))



}
