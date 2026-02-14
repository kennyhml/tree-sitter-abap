import { kw, kws } from '../helpers/keywords.js'

export default {

    _visibility: _ => choice(...kws("public", "protected", "private")),

    abstract_spec: _ => kw("abstract"),

    read_only_spec: _ => kw("read-only"),

    for_testing_spec: _ => seq(...kws("for", "testing")),

    final_spec: _ => kw("final"),

    public_spec: _ => kw("public"),

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