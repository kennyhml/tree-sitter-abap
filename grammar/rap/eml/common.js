// https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/abapcommon_eml_elements.html
module.exports = {
  /*
   * ... IN LOCAL MODE ...
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPIN_LOCAL_MODE.html
   */
  in_local_mode: _ => seq(...gen.kws("in", "local", "mode")),

  /*
   * ... WITH CHANGES ...
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPEML_READ_WITH_CHANGES.html
   */
  with_changes: _ => seq(...gen.kws("with", "changes")),

  /*
   * ... [FORWARDING] PRIVILEGED ...
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPEML_PRIVILEGED.html
   */
  privileged: _ => seq(optional(gen.kw("forwarding")), gen.kw("privileged")),

  /*
   * ... [FAILED failed_resp]
   *     [MAPPED mapped_resp]
   *     [REPORTED reported_resp] ...
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPEML_RESPONSE.html
   */
  response_parameters: $ =>
    repeat1(choice($.failed_spec, $.mapped_spec, $.reported_spec)),

  failed_spec: $ => seq(gen.kw("failed"), $.writable_expression),

  reported_spec: $ => seq(gen.kw("reported"), $.writable_expression),

  mapped_spec: $ => seq(gen.kw("mapped"), $.writable_expression),

  result_table_spec: $ => seq(gen.kw("result"), $.writable_expression),

  link_table_spec: $ => seq(gen.kw("link"), $.writable_expression),

  /*
   * An additional pair of parentheses following an associated abstract entity _ent
   * containing components (e. g. comp1) denotes that _ent is not flagged itself but
   * the subcomponents specified:
   *
   * ... FIELDS ( ... _ent ( comp1 comp2 ... ) ... ) WITH ...
   *
   * + before the additional pair of parentheses following an associated abstract entity _ent
   * containing components (e. g. comp1) denotes that the specified subcomponents are
   * flagged and the abstract entity _ent itself, too:
   * ... FIELDS ( ... _ent +( comp1 comp2 ... ) ... ) WITH ...
   */
  fields_spec: $ =>
    seq(
      gen.kw("fields"),
      "(",
      repeat(choice($.identifier, $.deep_entity_fields)),
      ")",
    ),

  deep_entity_fields: $ =>
    seq(
      field("entity", $.identifier),
      optional("+"),
      "(",
      repeat1(choice($.identifier, $.deep_entity_fields)),
      ")",
    ),

  // For selective function and action results.
  request_spec: $ =>
    seq(gen.kw("request"), field("value", $.general_expression)),

  result_spec: $ => seq(gen.kw("result"), field("value", $.writable_expression)),

  operations_table_spec: $ =>
    seq(gen.kw("operations"), field("value", $.general_expression)),

  from_fields_table_spec: $ =>
    seq(gen.kw("from"), field("value", $.general_expression)),

  with_fields_table_spec: $ =>
    seq(gen.kw("with"), field("value", $.general_expression)),
};
