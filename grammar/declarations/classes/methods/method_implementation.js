module.exports = {
  /**
   * METHOD meth.
   *   ...
   * ENDMETHOD.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHOD.html
   */
  method_implementation: ($) =>
    seq(
      gen.kw("method"),
      field("name", choice($.identifier, $.component_selection)),
      ".",
      optional($.method_body),
      gen.kw("endmethod"),
      ".",
    ),

  method_body: ($) => repeat1($.simple_statement),
};
