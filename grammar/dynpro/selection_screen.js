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
        $.horizontal_line_statement
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_NORMAL.html
    begin_of_screen_statement: $ => seq(
        ...kws("begin", "of", "screen"),
        field("dynnr", $.number),
        optional($.title_spec),
        optional($.window_spec)
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_SUBSCREEN.html
    begin_of_subscreen_statement: $ => seq(
        ...kws("begin", "of", "screen"),
        field("dynnr", $.number),
        ...kws("as", "subscreen"),
        optional($.no_intervals_spec),
        optional($.nesting_level_spec)
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
        optional($.frame_spec),
        optional($.no_intervals_spec),
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

}