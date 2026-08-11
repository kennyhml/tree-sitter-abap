module.exports = {
  _data_cluster_table_area: $ =>
    seq(
      field("table", $.identifier),
      gen.immediateTightParens(field("area", $._immediate_identifier)),
    ),

  data_cluster_to_spec: $ =>
    seq(gen.kw("to"), field("work_area", $._write_target)),

  data_cluster_client_spec: $ =>
    seq(gen.kw("client"), field("client", $._simple_operand)),

  data_cluster_id_spec: $ =>
    seq(gen.kw("id"), field("id", $._simple_operand)),
};
