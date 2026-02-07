/// <reference types="tree-sitter-cli/dsl" />
import { kw, kws } from '../helpers/keywords.js'
import { chainable } from '../helpers/decl_gen.js'

// https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abapselection-screen.html
export default {

    selection_screen_statement: $ => chainable(
        "selection-screen", $.__selection_screen_element
    ),

    /**
     * Any element that is preceded by a `SELECTION_SCREEN` or `SELECTION_SCREEN:`.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN.html
     */
    __selection_screen_element: $ => choice(
        $.begin_of_screen_element,
        $.begin_of_subscreen_element,
        $.end_of_screen_element,
        $.begin_of_block_element,
        $.end_of_block_element,
        $.begin_of_tabbed_block_element,
        $.horizontal_line_element,
        $.comment_element,
        $.pushbutton_element,
        $.tab_element,

        $.blank_line_directive,
        $.begin_of_line_directive,
        $.end_of_line_directive,
        $.screen_position_directive,
        $.function_key_directive
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_NORMAL.html
    begin_of_screen_element: $ => seq(
        ...kws("begin", "of", "screen"),
        field("dynnr", $.number),
        repeat(choice(
            field("title", $.title_spec),
            field("window", $.window_spec)
        ))
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_SUBSCREEN.html
    begin_of_subscreen_element: $ => seq(
        ...kws("begin", "of", "screen"),
        field("dynnr", $.number),
        ...kws("as", "subscreen"),
        repeat(choice(
            field("nesting", $.nesting_level_spec),
            field("intervals", $.no_intervals_spec),
        ))
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_TABBED.html
    begin_of_tabbed_block_element: $ => seq(
        ...kws("begin", "of", "tabbed", "block"),
        field("block", $.identifier),
        field("lines", $.tab_lines_spec),
        optional(field("intervals", $.no_intervals_spec)),
    ),

    /**
     * Tab element (button) of a tabbed block.
     * 
     * Refer to {@link begin_of_tabbed_block_element}
     */
    tab_element: $ => seq(
        kw("tab"),
        "(", field("length", $._immediate_number), token.immediate(")"),
        field("name", $.identifier),
        field("user_command", $.user_command_spec),
        repeat(choice(
            field("default", $.default_tab_screen_spec),
            field("modif_id", $.modif_id_spec),
        ))
    ),

    /**
     * Closes a {@link begin_of_screen_element} or {@link begin_of_subscreen_statement}
     */
    end_of_screen_element: $ => seq(
        ...kws("end", "of", "screen"),
        field("dynnr", $.number),
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_BLOCK.html
    begin_of_block_element: $ => seq(
        ...kws("begin", "of", "block"),
        field("block", $.identifier),
        repeat(choice(
            field("frame", $.frame_spec),
            field("intervals", $.no_intervals_spec),
        ))
    ),

    /**
     * Closes a {@link begin_of_block_element} or {@link begin_of_tabbed_block_element}.
     */
    end_of_block_element: $ => seq(
        ...kws("end", "of", "block"),
        field("block", $.identifier),
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_SKIP.html
    blank_line_directive: $ => seq(
        kw("skip"),
        optional(field("times", $.number))
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_ULINE.html
    horizontal_line_element: $ => seq(
        kw("uline"),
        optional($.output_position_spec),
        optional(field("modif_id", $.modif_id_spec))
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_COMMENT.html
    comment_element: $ => seq(
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
    pushbutton_element: $ => seq(
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
    begin_of_line_directive: _ => seq(...kws("begin", "of", "line")),

    screen_position_directive: $ => seq(
        kw("position"),
        field("position", $.output_position_spec),
    ),

    /**
     * Since this only actives an existing element (key 0 to 5) this should
     * be considered a directive rather than an element.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_FUNCTIONKEY.html
     */
    function_key_directive: $ => seq(
        ...kws("function", "key"),
        field("number", $.number)
    ),

    end_of_line_directive: _ => seq(...kws("end", "of", "line")),

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

    tab_lines_spec: $ => seq(
        kw("for"),
        field("number", $.number),
        kw("lines")
    ),

    default_tab_screen_spec: $ => seq(
        kw("default"),
        optional(seq(
            kw("program"),
            field("program", $.identifier)
        )),
        kw("screen"),
        field("dynnr", $.number)
    ),

    window_spec: _ => seq(...kws("as", "window")),

    __element_text: $ => choice(
        $.identifier,
        $.struct_component_selector
    ),
}