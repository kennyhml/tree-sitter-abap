module.exports = {
  /**
   * ... [OPTIONS]
   *       [USING ...]
   *       [PRIVILEGED ACCESS]
   *       [BYPASSING BUFFER]
   *       [CONNECTION ...] ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPSELECT_OPTIONS.html
   */
  sql_options_spec: $ =>
    seq(optional(gen.kw("options")), $.__sql_options_spec),

  __sql_options_spec: $ =>
    choice(
      seq(
        $.sql_using_client_spec,
        optional($.privileged_access),
        optional($.bypassing_buffer),
        optional($.connection_spec),
      ),
      seq(
        $.privileged_access,
        optional($.bypassing_buffer),
        optional($.connection_spec),
      ),
      seq($.bypassing_buffer, optional($.connection_spec)),
      $.connection_spec,
    ),

  /**
   * ... USING { CLIENT clnt
   *           | CLIENTS IN @client_range_tab
   *           | CLIENTS IN T000
   *           | ALL CLIENTS } ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPSELECT_OPTIONS_USING.html
   */
  sql_using_client_spec: $ =>
    seq(
      gen.kw("using"),
      choice($.single_client, $.clients_in, $.all_clients),
    ),

  single_client: $ =>
    seq(gen.kw("client"), field("client", $._sql_client_operand)),

  clients_in: $ =>
    seq(
      ...gen.kws("clients", "in"),
      field("source", $._sql_client_operand),
    ),

  all_clients: _ => seq(...gen.kws("all", "clients")),

  /**
   * ... DECLARE CLIENT clnt_col ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECT_DECLARE_CLIENT.html
   */
  sql_declare_client_spec: $ =>
    seq(
      ...gen.kws("declare", "client"),
      field("column", $.identifier),
    ),

  _sql_client_operand: $ =>
    choice($.sql_host_expression, $.sql_host_variable, $._simple_operand),

  privileged_access: _ => seq(...gen.kws("privileged", "access")),

  bypassing_buffer: _ => seq(...gen.kws("bypassing", "buffer")),

  /**
   * ... CONNECTION @con_ref|con|(con_syntax) ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPSELECT_CONNECTION.html
   */
  connection_spec: $ =>
    seq(
      gen.kw("connection"),
      field(
        "connection",
        choice(
          $.sql_host_variable,
          $.dynamic_spec,
          alias(/[a-z_\/][a-z\d_\/*]*/i, $.identifier),
        ),
      ),
    ),
};
