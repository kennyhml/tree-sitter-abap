module.exports = {
  aliases_declaration: $ => seq($.__aliases_declaration_prefix, "."),

  __aliases_declaration_prefix: $ =>
    gen.chainable("aliases", $.alias_spec),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPALIASES.html
  alias_spec: $ =>
    seq(field("alias", $.identifier), gen.kw("for"), $.component_selection),
};
