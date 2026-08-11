module.exports = {
  /*
   * FREE MEMORY ID id.
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPFREE_MEMORY.html
   */
  free_memory_statement: $ => seq($.__free_memory_statement_prefix, "."),

  __free_memory_statement_prefix: $ =>
    seq(...gen.kws("free", "memory", "id"), field("id", $._simple_operand)),

  /*
   * DELETE FROM {
   *   {MEMORY ID id}
   *   | {DATABASE dbtab(ar) [CLIENT cl] ID id}
   *   | {SHARED MEMORY dbtab(ar) [CLIENT cl] ID id}
   *   | {SHARED BUFFER dbtab(ar) [CLIENT cl] ID id}
   * }.
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPDELETE_CLUSTER.html
   */
  delete_from_statement: $ => seq($.__delete_from_statement_prefix, "."),

  __delete_from_statement_prefix: $ =>
    seq(
      ...gen.kws("delete", "from"),
      field(
        "medium",
        choice(
          $.delete_memory_spec,
          $.delete_database_spec,
          $.delete_shared_memory_spec,
          $.delete_shared_buffer_spec,
        ),
      ),
    ),

  delete_memory_spec: $ => seq(gen.kw("memory"), $.data_cluster_id_spec),

  delete_database_spec: $ =>
    seq(gen.kw("database"), $.__cluster_delete_spec),

  delete_shared_memory_spec: $ =>
    seq(...gen.kws("shared", "memory"), $.__cluster_delete_spec),

  delete_shared_buffer_spec: $ =>
    seq(...gen.kws("shared", "buffer"), $.__cluster_delete_spec),

  __cluster_delete_spec: $ =>
    seq(
      field("table", $.identifier),
      gen.immediateTightParens(field("area", $._immediate_identifier)),
      optional($.data_cluster_client_spec),
      $.data_cluster_id_spec,
    ),

  data_cluster_client_spec: $ =>
    seq(gen.kw("client"), field("client", $._simple_operand)),

  data_cluster_id_spec: $ =>
    seq(gen.kw("id"), field("id", $._simple_operand)),
};
