module.exports = {
  /**
   * METHOD meth.
   *   ...
   * ENDMETHOD.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHOD.html
   */
  method_implementation: $ => seq($.__method_implementation_prefix, "."),

  __method_implementation_prefix: $ =>
    seq(
      gen.kw("method"),
      field("name", choice($.identifier, $.component_selection)),
      optional($.by_database_spec),
      ".",
      optional($.method_body),
      gen.kw("endmethod"),
    ),

  method_body: $ => repeat1($.simple_statement),
};
