/// <reference types="tree-sitter-cli/dsl" />
import { kw, kws } from '../helpers/keywords.js'
import { declaration } from '../helpers/decl_gen.js'

// https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abapselection-screen.html
export default {

    selection_screen_statement: $ => declaration(
        "selection-screen", repeat1($.__selection_screen_statement)
    ),

    /**
     * Any statement that is preceded by a `SELECTION_SCREEN` or `SELECTION_SCREEN:`.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN.html
     */
    __selection_screen_statement: $ => choice(
        $.begin_of_screen_statement,
        $.begin_of_subscreen_statement,
        $.end_of_screen_statement,
        $.begin_of_block_statement,
        $.end_of_block_statement,
        $.blank_line_statement,
        $.horizontal_line_statement,
        $.comment_statement,
        $.pushbutton_statement,
        $.begin_of_line_statement,
        $.screen_position_statement,
        $.end_of_line_statement
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_NORMAL.html
    begin_of_screen_statement: $ => seq(
        ...kws("begin", "of", "screen"),
        field("dynnr", $.number),
        repeat(choice(
            field("title", $.title_spec),
            field("window", $.window_spec)
        ))
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_SUBSCREEN.html
    begin_of_subscreen_statement: $ => seq(
        ...kws("begin", "of", "screen"),
        field("dynnr", $.number),
        ...kws("as", "subscreen"),
        repeat(choice(
            field("nesting", $.nesting_level_spec),
            field("intervals", $.no_intervals_spec),
        ))
    ),

    /**
     * Closes a {@link begin_of_screen_statement} or {@link begin_of_subscreen_statement}
     */
    end_of_screen_statement: $ => seq(
        ...kws("end", "of", "screen"),
        field("dynnr", $.number),
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_BLOCK.html
    begin_of_block_statement: $ => seq(
        ...kws("begin", "of", "block"),
        field("block", $.identifier),
        repeat(choice(
            field("frame", $.frame_spec),
            field("intervals", $.no_intervals_spec),
        ))
    ),

    end_of_block_statement: $ => seq(
        ...kws("end", "of", "block"),
        field("block", $.identifier),
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_SKIP.html
    blank_line_statement: $ => seq(
        kw("skip"),
        optional(field("times", $.number))
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_ULINE.html
    horizontal_line_statement: $ => seq(
        kw("uline"),
        optional($.output_position_spec),
        optional(field("modif_id", $.modif_id_spec))
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_COMMENT.html
    comment_statement: $ => seq(
        kw("comment"),
        field("position", $.output_position_spec),
        choice(
            field("text", $.__element_text),
            $.for_select_option_spec
        ),
        repeat(choice(
            field("visible_length", $.visible_length_spec),
            field("modif_id", $.modif_id_spec)
        ))
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_COMMENT.html
    pushbutton_statement: $ => seq(
        kw("pushbutton"),
        field("position", $.output_position_spec),
        field("text", $.__element_text),
        field("user_command", $.user_command_spec),
        repeat(choice(
            field("visible_length", $.visible_length_spec),
            field("modif_id", $.modif_id_spec)
        ))
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_LINE.html
    begin_of_line_statement: _ => seq(...kws("begin", "of", "line")),

    screen_position_statement: $ => seq(
        kw("position"),
        field("position", $.output_position_spec),
    ),

    end_of_line_statement: _ => seq(...kws("end", "of", "line")),

    for_select_option_spec: $ => seq(
        optional(field("text", $.__element_text)),
        ...kws("for", "field"),
        field("target", $.identifier),
    ),

    title_spec: $ => seq(
        kw("title"),
        field("title", choice(
            $.literal_string,
            $.struct_component_selector,
            $.identifier
        ))
    ),

    frame_spec: $ => seq(
        ...kws("with", "frame"),
        optional($.title_spec)
    ),

    nesting_level_spec: $ => seq(
        ...kws("nesting", "level"),
        field("level", $.number)
    ),

    window_spec: _ => seq(...kws("as", "window")),

    __element_text: $ => choice(
        $.identifier,
        $.struct_component_selector
    ),
}