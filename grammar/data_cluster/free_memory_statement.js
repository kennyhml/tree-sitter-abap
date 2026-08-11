module.exports = {
  /*
   * FREE MEMORY ID id.
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPFREE_MEMORY.html
   */
  free_memory_statement: $ => seq($.__free_memory_statement_prefix, "."),

  __free_memory_statement_prefix: $ =>
    seq(
      ...gen.kws("free", "memory", "id"),
      field("id", $._simple_operand),
    ),
};
