module.exports = {
  /**
   * MODULE mod {OUTPUT|[INPUT]}.
   *   ...
   * ENDMODULE.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMODULE.html
   */
  ...gen.periodTerminated("module_definition", $ =>
    seq(
      gen.kw("module"),
      field("name", $.identifier),
      optional(field("kind", $.__module_kind)),
      ".",
      optional(field("body", $.statement_block)),
      gen.kw("endmodule"),
    ),
  ),

  __module_kind: $ => choice($.output, $.input),

  output: _ => gen.kw("output"),

  input: _ => gen.kw("input"),
};
