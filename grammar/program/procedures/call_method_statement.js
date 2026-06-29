module.exports = {

  /**
   *
   * CALL METHOD dynamic_meth { parameter_list | parameter_tables }.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCALL_METHOD_METH_IDENT_DYNA.html
   */
  call_method_statement: ($) =>
    seq(
      ...gen.kws("call", "method"),
      field(
        "name",
        choice($.identifier, $.dynamic_spec, $.component_selection),
      ),
      optional($.call_argument_list),
      ".",
    ),
}
