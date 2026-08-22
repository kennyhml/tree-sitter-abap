module.exports = {
  /*
   * Which arguments can or must be passed differs per concrete function.
   * Adding all functions explicitly is not feasible due to parser size.
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABENSQL_BUILTIN_FUNC.html
   */
  sql_function_call: $ =>
    seq(
      field("name", $.identifier),
      token.immediate("("),
      // scalar functions may have no arguments
      optional(
        seq(
          // aggregates with DISTINCT
          optional($.distinct),
          field(
            "argument",
            choice(
              // aggregates with *
              $.select_wildcard,
              // general argument lists (named or unnamed)
              $._sql_expression,
              $.sql_positional_argument_list,
              $.sql_named_argument_list,
            ),
          ),
          // type casts with AS for cast or avg
          optional(seq(gen.kw("as"), field("type", $.sql_cast_type))),
          // aggregates with ORDER BY
          optional($.sql_function_order_by_spec),
        ),
      ),
      ")",
    ),

  sql_cast_type: $ =>
    seq(
      field("name", $.identifier),
      // eg CURR[( len[, decimals] )]
      optional(
        seq(
          token.immediate("("),
          field("length", $.number),
          optional(seq(",", field("decimals", $.number))),
          ")",
        ),
      ),
    ),

  sql_function_order_by_spec: $ =>
    seq(...gen.kws("order", "by"), $.order_by_list),

  sql_named_argument_list: $ => gen.commaSep1($.sql_named_argument),

  sql_named_argument: $ =>
    seq(field("name", $.identifier), "=", field("value", $._sql_expression)),

  sql_positional_argument_list: $ => prec(-1, gen.commaSep1($._sql_expression)),
};
