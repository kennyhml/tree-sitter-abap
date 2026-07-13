module.exports = {
  /**
   * COLLECT wa INTO itab [result].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCOLLECT.html
   */
  collect_statement: $ =>
    seq(
      gen.kw("collect"),
      field("source", $.general_expression),
      $.into,
      optional(choice($.reference_into, $.assigning)),
      ".",
    ),
};
