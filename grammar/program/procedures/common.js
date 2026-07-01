module.exports = {

  /**
   * ... [EXPORTING  p1 = a1 p2 = a2 ...] 
   *     [IMPORTING  p1 = a1 p2 = a2 ...] 
   *     [CHANGING   p1 = a1 p2 = a2 ...] 
   *     [RECEIVING  r  = a  ] 
   *     [EXCEPTIONS [exc1 = n1 exc2 = n2 ...] 
   *     [OTHERS = n_others] ].
   * 
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCALL_METHOD_PARAMETERS.html
   */
  call_argument_list: $ => choice(
    repeat1(
      choice(
        $._importing_args,
        $._exporting_args,
        $._changing_args,
        $._receiving_args,
        $._tables_args,
        $._parameter_table_args,
        $._exception_table_args,
        $._tables_args,
        $._exceptions_args,
      )
    ),
    // In method calls, if the parameter is not preceded by the parameter type,
    // its always exporting. Only one positional argument or any number of
    // named arguments may follow.
    field("exporting", choice(
      $._named_argument_list,
      $.positional_argument
    )),
  ),

  // Needs higher prec than parenthesized expressions
  // on order to get arithmetic to work
  positional_argument: $ => prec(7, field("value",
    choice(
      $.data_object,
      $.constructor_expression,
      $.function_call,
      $.table_expression,
      $.arithmetic_expression,
      $.string_expression,
      $.dereference_expression,
    ),
  )),

  named_argument: $ => seq(
    field("name",
      choice(
        $.identifier,
        $.dynamic_spec,       // dynamic param spec in dynamic method calls
        $.component_selection // for components of structures
      )
    ),
    "=",
    field("value", choice(
      $.general_expression,
      $.declaration_expression
    ))
  ),

  _parenthesized_call_arguments: $ => seq(
    token.immediate("("),
    token.immediate(/[\t\n\r ]/), // disambiguate from dynamic stuff, a space must exist here.
    optional($.call_argument_list),
    ")",
  ),

  /**
   * We cant be using positional argument LISTS in all argument lists
   * as it causes conflicts with how unary operators work in arithmetic
   * expressions. Consider:
   *
   * value #( ( foo + bar) )
   *
   * Its not possible to tell if its an aritmetic addition expression
   * or the argument foo alongside a unary operation argument + bar.
   *
   * In forms, multiple positional arguments are allowed - but no expressions
   * so this problem does not occur.
   */
  argument_list: $ => seq(
    choice(
      repeat1($.named_argument),
      $.positional_argument
    )
  ),


  _importing_args: $ => gen.kw_tagged("importing", $._named_argument_list),
  _exporting_args: $ => gen.kw_tagged("exporting", $._named_argument_list),
  _changing_args: $ => gen.kw_tagged("changing", $._named_argument_list),
  _receiving_args: $ => gen.kw_tagged("receiving", $._named_argument_list),
  _tables_args: $ => gen.kw_tagged("tables", $._named_argument_list),
  _exceptions_args: $ => gen.kw_tagged("exceptions", $._exception_mapping_list),
  _parameter_table_args: $ => gen.kw_tagged("parameter-table", $.named_data_object),
  _exception_table_args: $ => gen.kw_tagged("exception-table", $.named_data_object),

  /**
   * An argument list where only named arguments can occur. This is needed
   * in statements such as {@link raise_exception} because positional args
   * are impossible in that position and cause parser conflicts.
   */
  _named_argument_list: $ => prec.right(
    alias(repeat1($.named_argument), $.argument_list)
  ),

  /**
   * An argument list where only positional arguments can occur.
   * Required for calls to a form using {@link subroutine_call}.
   *
   * WARN: Expressions are not possible here!!!
   */
  _positional_argument_list: $ => prec.right(
    alias(repeat1(alias($.named_data_object, $.positional_argument)), $.argument_list)
  ),

  _exception_mapping_list: $ => alias(repeat1($.exception_mapping), $.argument_list),

  exception_mapping: $ => seq(
    field("name", $.identifier),
    "=",
    field("value", $.number),
    optional(seq(
      gen.kw("message"),
      field("message", $.named_data_object)
    ))
  ),
}
