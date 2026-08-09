module.exports = {
  /*
   * AUTHORITY-CHECK DISABLE BEGIN CONTEXT bdef~context_name
   *  ...
   * AUTHORITY-CHECK DISABLE END.
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPAUTHORITY-CHECK_DISABLE.html
   */
  authority_check_disable_statement: $ =>
    seq($.__authority_check_disable_prefix, "."),

  __authority_check_disable_prefix: $ =>
    seq(
      ...gen.kws("authority-check", "disable", "begin"),
      $.authorization_context_spec,
      ".",
      optional(field("body", $.statement_block)),
      ...gen.kws("authority-check", "disable", "end"),
    ),

  authorization_context_spec: $ =>
    seq(
      gen.kw("context"),
      field(
        "context",
        alias($.__business_object_component_selection, $.component_selection),
      ),
    ),
};
