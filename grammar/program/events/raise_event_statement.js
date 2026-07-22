module.exports = {
  /**
   * RAISE EVENT evt [EXPORTING p1 = a1 p2 = a2 ...].
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPRAISE_EVENT.html
   */
  raise_event_statement: $ => seq($.__raise_event_statement_prefix, "."),

  __raise_event_statement_prefix: $ =>
    seq(
      ...gen.kws("raise", "event"),
      field("name", choice($.identifier, $.component_selection)),
      optional($._exporting_args),
    ),
};
