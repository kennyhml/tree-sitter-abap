module.exports = {
  /*
   * RAISE ENTITY EVENT ent~evt FROM tab.
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPRAISE_ENTITY_EVENT.html
   */
  raise_entity_event_statement: $ =>
    seq($.__raise_entity_event_statement_prefix, "."),

  __raise_entity_event_statement_prefix: $ =>
    seq(
      ...gen.kws("raise", "entity", "event"),
      field("event", $.component_selection),
      $.event_parameters_spec,
    ),

  event_parameters_spec: $ =>
    seq(gen.kw("from"), field("value", $.expression)),
};
