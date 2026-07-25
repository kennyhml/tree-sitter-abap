module.exports = {
  /*
   * SET HANDLER handler1 handler2 ... FOR { oref |{ALL INSTANCES} }
   *                               [ACTIVATION act].
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPSET_HANDLER.html
   */
  set_handler_statement: $ => seq($.__set_handler_statement_prefix, "."),

  __set_handler_statement_prefix: $ =>
    seq(
      ...gen.kws("set", "handler"),
      $.event_handler_list,
      repeat($.__set_handler_addition),
    ),

  // handler1 handler2
  event_handler_list: $ => repeat1(choice($.identifier, $.component_selection)),

  __set_handler_addition: $ =>
    choice($.activation_spec, $.for_instance_spec),

  // ACTIVATION act
  activation_spec: $ =>
    seq(gen.kw("activation"), field("activate", $.data_object)),

  // FOR { oref |{ALL INSTANCES} }
  for_instance_spec: $ =>
    seq(
      gen.kw("for"),
      field("instance", choice($.general_expression, $.all_instances)),
    ),

  all_instances: _ => seq(...gen.kws("all", "instances")),
};
