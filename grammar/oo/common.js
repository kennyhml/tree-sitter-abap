const gen = require("../core/generators.js")

module.exports = {

    _visibility: _ => choice(...gen.kws("public", "protected", "private")),

    abstract_spec: _ => gen.kw("abstract"),

    read_only_spec: _ => gen.kw("read-only"),

    for_testing_spec: _ => seq(...gen.kws("for", "testing")),

    final_spec: _ => gen.kw("final"),

    public_spec: _ => gen.kw("public"),

    // Any definition that may live inside a class / interface body.
    _class_component: $ => choice(
        $.data_declaration,
        $.class_data_declaration,
        $.constants_declaration,
        $.types_declaration,
        $.aliases_declaration,
        $.interfaces_declaration,
        $.methods_declaration,
        $.class_methods_declaration,
        $._empty_statement,
    ),
}