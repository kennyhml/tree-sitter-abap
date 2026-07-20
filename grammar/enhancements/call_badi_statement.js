module.exports = {
  /**
   * CALL BADI { badi->meth parameter_list }
   *           | { badi->(meth_name) { parameter_list | parameter_tables } }.
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPCALL_BADI.html
   */
  call_badi_statement: $ => seq($.__call_badi_statement_prefix, "."),

  __call_badi_statement_prefix: $ =>
    seq(
      ...gen.kws("call", "badi"),
      field("name", $.component_selection),
      optional($.call_argument_list),
    ),
};
