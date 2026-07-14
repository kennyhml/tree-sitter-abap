module.exports = {
  /**
   * Implicit:
   * CREATE OBJECT oref [area_handle] [parameter_list].
   *
   * Explicit:
   * CREATE OBJECT oref [area_handle]
   *        TYPE { class [parameter_list] }
   *        / { (name) [parameter_list|parameter_tables] }.
   *
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCREATE_OBJECT.html
   */
  create_object_statement: $ =>
    seq(
      ...gen.kws("create", "object"),
      field("subject", $.writable_expression),
      optional($.object_area_handle_spec),
      optional(
        choice(
          field("typing", $.referred_type),
          seq(gen.kw("type"), field("type", $.dynamic_spec)),
        ),
      ),
      optional($._exporting_args),
      optional($._exceptions_args),
      optional($._parameter_table_args),
      ".",
    ),

  /**
   * CREATE OBJECT oref AREA HANDLE handle ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCREATE_OBJECT_AREA_HANDLE.html
   */
  object_area_handle_spec: $ =>
    seq(...gen.kws("area", "handle"), field("handle", $.writable_expression)),
};
