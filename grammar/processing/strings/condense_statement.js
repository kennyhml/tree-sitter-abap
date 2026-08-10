module.exports = {
  /**
   * CONDENSE text [NO-GAPS].
   *
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCONDENSE.html
   */
  condense_statement: $ => seq($.__condense_statement_prefix, "."),

  __condense_statement_prefix: $ =>
    seq(
      gen.kw("condense"),
      field("text", $._modifiable_target),
      optional($.no_gaps),
    ),

  no_gaps: _ => gen.kw("no-gaps"),
};
