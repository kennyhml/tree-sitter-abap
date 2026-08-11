module.exports = {
  /** dbtab(ar) */
  _data_cluster_table_area: $ =>
    seq(
      field("table", $.identifier),
      gen.immediateTightParens(field("area", $._immediate_identifier)),
    ),

  /** TO wa */
  data_cluster_to_spec: $ =>
    seq(gen.kw("to"), field("work_area", $._write_target)),

  /** FROM wa */
  data_cluster_from_spec: $ =>
    seq(gen.kw("from"), field("work_area", $._reference_operand)),

  /** CLIENT cl */
  data_cluster_client_spec: $ =>
    seq(gen.kw("client"), field("client", $._simple_operand)),

  /** ID id */
  data_cluster_id_spec: $ =>
    seq(gen.kw("id"), field("id", $._simple_operand)),
};
