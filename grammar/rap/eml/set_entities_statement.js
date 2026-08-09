module.exports = {
  /*
   * SET ENTITIES OF root_entity { BLOCKED | UNBLOCKED }.
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPSET_ENTITIES.html
   */
  set_entities_statement: $ => seq($.__set_entities_statement_prefix, "."),

  __set_entities_statement_prefix: $ =>
    seq(
      ...gen.kws("set", "entities", "of"),
      field("business_object", $.business_object),
      field("state", choice($.blocked, $.unblocked)),
    ),

  blocked: _ => gen.kw("blocked"),

  unblocked: _ => gen.kw("unblocked"),
};
