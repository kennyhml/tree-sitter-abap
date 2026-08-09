module.exports = {
  /*
   * SET FLAGS src FROM NAMES fields { MAPPING { TYPE p_type }
   *                                         | { LIKE var }
   *                                 }.
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPSET_FLAGS.html
   */
  set_flags_statement: $ => seq($.__set_flags_statement_prefix, "."),

  __set_flags_statement_prefix: $ =>
    seq(
      ...gen.kws("set", "flags"),
      field("subject", $.general_expression),
      $.from_names_spec,
      optional(choice($.mapping_like_spec, $.mapping_type_spec)),
    ),

  /*
   * SET NAMES fields FROM FLAGS src { MAPPING { TYPE p_type }
   *                                         | { LIKE var }
   *                                 }.
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPSET_NAMES.html
   */
  set_names_statement: $ => seq($.__set_names_statement_prefix, "."),

  __set_names_statement_prefix: $ =>
    seq(
      ...gen.kws("set", "names"),
      field("subject", $.general_expression),
      $.from_flags_spec,
      optional(choice($.mapping_like_spec, $.mapping_type_spec)),
    ),

  from_names_spec: $ =>
    seq(...gen.kws("from", "names"), field("fields", $.general_expression)),

  from_flags_spec: $ =>
    seq(...gen.kws("from", "flags"), field("flags", $.general_expression)),

  mapping_type_spec: $ =>
    seq(...gen.kws("mapping", "type"), field("name", $.identifier)),

  mapping_like_spec: $ =>
    seq(
      ...gen.kws("mapping", "like"),
      field("object", choice($.identifier, $.component_selection)),
    ),
};
