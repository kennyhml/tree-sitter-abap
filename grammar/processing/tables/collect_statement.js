module.exports = {
  /**
   * COLLECT wa INTO itab [result].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCOLLECT.html
   */
  collect_statement: $ => seq($.__collect_statement_prefix, "."),

  __collect_statement_prefix: $ =>
    seq(
      gen.kw("collect"),
      field("source", $.general_expression),
      $.into_spec,
      optional($._itab_mutation_result),
    ),
};
