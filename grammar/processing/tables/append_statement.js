module.exports = {
  /**
   * APPEND line_spec TO itab [SORTED BY comp] [result].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abapappend.html
   */
  append_statement: $ => seq($.__append_statement_prefix, "."),

  __append_statement_prefix: $ =>
    seq(
      gen.kw("append"),
      field("lines", $._line_spec),
      gen.kw("to"),
      field("subject", $._modifiable_target),
      optional(alias($.__append_sorted_by_spec, $.sorted_by_spec)),
      optional(field("result", $._itab_mutation_result)),
    ),

  /**
   * [SORTED BY comp]
   */
  __append_sorted_by_spec: $ =>
    seq(...gen.kws("sorted", "by"), field("comp", $.itab_comp)),
};
