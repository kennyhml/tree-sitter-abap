module.exports = {
    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_NORMAL.html
    dynpro_screen_definition: $ => seq(
        optional(seq(kw("selection-screen"), optional(":"))),
        ...kws("begin", "of", "screen"),
        field("dynnr_start", $.number),
        optional(
            seq(kw("title"),
                field("title", choice(
                    $.literal_string,
                    $.struct_component_selector,
                    $.identifier
                ))
            )
        ),
        optional(seq(...kws("as", "window"))),
        choice(".", ","),
        repeat(
            $.dynpro_input_element,
            $.dynpro_screen_element
        ),
        optional(seq(kw("selection-screen"), optional(":"))),
        ...kws("end", "of", "screen"),
        field("dynnr_end", $.number),
        choice(",", ".")
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_DEFINITION.html
    dynpro_subscreen_definition: $ => prec.left(seq(
        optional(seq(kw("selection-screen"), optional(":"))),
        ...kws("begin", "of", "screen"),
        field("dynnr_start", $.number),
        ...kws("as", "subscreen"),
        repeat(
            choice(
                seq(...kws("no", "intervals")),
                seq(...kws("nesting", "level"), field("nesting", $.number)),
            )
        ),
        choice(".", ","),
        repeat(
            $.dynpro_input_element,
            $.dynpro_screen_element
        ),
        optional(seq(kw("selection-screen"), optional(":"))),
        ...kws("end", "of", "screen"),
        field("dynnr_end", $.number),
        choice(".", ","),
    )),

    dynpro_block_definition: $ => prec.left(seq(
        ...kws("begin", "of", "block"),
        field("name_start", $.identifier),
        optional(
            seq(
                ...kws("with", "frame"),
                optional(seq(
                    kw("title"),
                    field("title",
                        $.literal_string,
                        $.data_component_selector,
                        $.identifier
                    ),
                ))
            )
        ),
        optional(seq(...kws("no", "intervals"))),
        ".",
        repeat($.dynpro_element),

        // Allow the end of screen statement to be missing for cleaner output.
        optional(seq(
            ...kws("selection-screen", "end", "of", "screen"),
            field("dynnr_end", $.number),
            "."
        ))
    )),

}