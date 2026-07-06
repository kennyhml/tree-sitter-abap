module.exports = {
  /**
   * ... REDUCE type(
   *      [let_exp]
   *      INIT {x1 = rhs1}|{<x1> = wrexpr1}|{x1|<x1> TYPE dtype1}
   *           {x2 = rhs2}|{<x2> = wrexpr2}|{x2|<x2> TYPE dtype2}
   *           ...
   *      FOR for_exp1
   *      FOR for_exp2
   *      ...
   * NEXT ...
   *      {x1 =|+=|-=|*=|/=|&&= rhs1}|{<x1> =|+=|-=|*=|/=|&&= wrexpr1}
   *      {x2 =|+=|-=|*=|/=|&&= rhs2}|{<x2> =|+=|-=|*=|/=|&&= wrexpr2}
   *      ... ) ...
   *
   *
   * While ABAP does not actually call these 'reduce expression' but 'constructor expression with
   * the REDUCE operator', I feel like its clearer to just speak of a reduce / reduction expression.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONSTRUCTOR_EXPRESSION_REDUCE.html
   */
  reduce_expression: $ =>
    seq(
      gen.kw("reduce"),
      field("result_type", $._constructor_result),
      "(",
      optional($.let_expression),
      $.accumulators,
      repeat1($.iteration_expression),
      $.reduce_next,
      ")",
    ),

  accumulators: $ => seq(gen.kw("init"), repeat1($.accumulator_spec)),

  reduce_next: $ =>
    seq(
      gen.kw("next"),
      repeat1(choice($.assignment, $.calculation_assignment)),
    ),

  /**
   * Cant use a simple assignment for this because its
   * possible to declare initial values and specify a type for them.
   */
  accumulator_spec: $ =>
    seq(
      field("name", choice($.identifier, $.field_symbol)),
      choice(
        seq("=", field("value", $.general_expression)),
        field("typing", $.typing),
      ),
    ),
};
