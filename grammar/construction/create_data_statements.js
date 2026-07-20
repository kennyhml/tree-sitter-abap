module.exports = {
  /**
   * Implicit:
   * CREATE DATA dref [area_handle].
   *
   * All other additions with an explicit type work the same as the
   * typing of a regular data declaration, except that a dynamic
   * type can be named, which is easier to just add to the typing.
   *
   * TODO: Bdef derived types
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCREATE_DATA.html
   */
  ...gen.periodTerminated("create_data_statement", $ =>
    seq(
      ...gen.kws("create", "data"),
      field("subject", $.writable_expression),
      optional($.object_area_handle_spec),
      optional(field("typing", choice($.typing, $.handle_type))),
    ),
  ),
};
