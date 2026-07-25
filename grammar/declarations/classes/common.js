module.exports = {
  _class_component: $ =>
    choice(
      $.data_declaration,
      $.class_data_declaration,
      $.events_declaration,
      $.class_events_declaration,
      $.constants_declaration,
      $.types_declaration,
      $.aliases_declaration,
      $.interfaces_declaration,
      $.methods_declaration,
      $.class_methods_declaration,
      $._empty_statement,
    ),

  abstract: _ => gen.kw("abstract"),

  final: _ => gen.kw("final"),

  public: _ => gen.kw("public"),

  for_testing: _ => seq(...gen.kws("for", "testing")),
};
