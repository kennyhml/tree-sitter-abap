const gen = require('../generators.js');

module.exports = {

    initial_value: _ => seq(...gen.kws("value", "is", "initial")),

    default_data_value: $ => seq(
        gen.kw("value"),
        field("val", choice(
            $.number,
            $.string_literal,
            $.identifier,
        ))
    ),

    with_header_line: _ => seq(...gen.kws("with", "header", "line")),

    read_only: _ => gen.kw("read-only"),

    occurs: $ => seq(
        gen.kw("occurs"),
        field("memory_requirement", $.number)
    ),

    initial_size: $ => seq(
        ...gen.kws("initial", "size"),
        field("size", $.number)
    ),
}