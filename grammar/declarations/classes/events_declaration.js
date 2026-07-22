module.exports = {
  /**
   * EVENTS evt [EXPORTING parameters].
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPEVENTS.html
   */
  events_declaration: $ => seq($.__events_declaration_prefix, "."),

  __events_declaration_prefix: $ => gen.chainable("events", $.event_spec),

  /*
   * CLASS-EVENTS evt [EXPORTING parameters].
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPCLASS-EVENTS.html
   */
  class_events_declaration: $ => seq($.__class_events_declaration_prefix, "."),

  __class_events_declaration_prefix: $ =>
    gen.chainable("class-events", $.event_spec),

  event_spec: $ =>
    seq(
      field("name", $.identifier),
      optional(gen.kw_tagged("exporting", $.parameters)),
    ),
};
