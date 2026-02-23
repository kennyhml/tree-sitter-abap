/// <reference types="tree-sitter-cli/dsl" />
const gen = require("../core/generators.js")

// https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abapselection-screen.html
module.exports = {

    selection_screen_statement: $ => gen.chainable(
        "selection-screen", $.__selection_screen_element
    ),

    /**
     * Any element that is preceded by a `SELECTION_SCREEN` or `SELECTION_SCREEN:`.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN.html
     */
    __selection_screen_element: $ => choice(
        // (Visual) screen elements
        $.begin_of_screen_element,
        $.end_of_screen_element,
        $.begin_of_block_element,
        $.end_of_block_element,
        $.begin_of_tabbed_block_element,
        $.horizontal_line_element,
        $.comment_element,
        $.pushbutton_element,
        $.tab_element,

        // Directives
        $.blank_line_directive,
        $.begin_of_line_directive,
        $.end_of_line_directive,
        $.screen_position_directive,
        $.function_key_directive,

        // Include elements
        $.include_parameter_directive,
        $.include_select_option_directive,
        $.include_comment_directive,
        $.include_pushbutton_directive,
        $.include_block_directive
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_NORMAL.html
    begin_of_screen_element: $ => prec.right(seq(
        ...gen.kws("begin", "of", "screen"),
        gen.chainable_immediate(choice($.screen_spec, $.subscreen_spec))
    )),

    // Inner spec of a screen element to support chaining.
    screen_spec: $ => seq(
        field("dynnr", $.number),
        repeat(choice(
            field("title", $.title_spec),
            field("window", $.window_spec)
        ))
    ),

    // Inner spec of a subscreen element to support chaining.
    subscreen_spec: $ => seq(
        field("dynnr", $.number),
        ...gen.kws("as", "subscreen"),
        repeat(choice(
            field("nesting", $.nesting_level_spec),
            field("intervals", $.no_intervals_spec),
        ))
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_TABBED.html
    begin_of_tabbed_block_element: $ => seq(
        ...gen.kws("begin", "of", "tabbed", "block"),
        $.__tabbed_block_spec
    ),

    __tabbed_block_spec: $ => seq(
        field("block", $.identifier),
        field("lines", $.tab_lines_spec),
        optional(field("intervals", $.no_intervals_spec)),
    ),

    /**
     * Tab element (button) of a tabbed block.
     * 
     * [SELECTION-SCREEN TAB (len) tab USER-COMMAND fcode 
     *      [DEFAULT [PROGRAM prog] SCREEN dynnr] 
     *      [MODIF ID modid] 
     *      [ldb_additions].] 
     * 
     * Refer to {@link begin_of_tabbed_block_element}
     */
    tab_element: $ => prec.right(seq(
        gen.kw("tab"),
        gen.chainable_immediate($.tab_spec)
    )),

    // Inner spec of a tab element to support chaining.
    tab_spec: $ => seq(
        "(",
        field("length", $._immediate_number),
        token.immediate(")"),

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
    end_of_screen_element: $ => prec.right(seq(
        ...gen.kws("end", "of", "screen"),
        gen.chainable_immediate(field("dynnr", $.number))
    )),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_BLOCK.html
    begin_of_block_element: $ => prec.right(seq(
        ...gen.kws("begin", "of", "block"),
        $.__block_spec
    )),

    __block_spec: $ => seq(
        field("block", $.identifier),
        repeat(choice(
            field("frame", $.frame_spec),
            field("intervals", $.no_intervals_spec),
        ))
    ),

    /**
     * Closes a {@link begin_of_block_element} or {@link begin_of_tabbed_block_element}.
     */
    end_of_block_element: $ => prec.right(seq(
        ...gen.kws("end", "of", "block"),
        gen.chainable_immediate(field("block", $.identifier)),
    )),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_SKIP.html
    blank_line_directive: $ => prec.right(seq(
        gen.kw("skip"),
        optional(gen.chainable_immediate(field("times", $.number)))
    )),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_ULINE.html
    horizontal_line_element: $ => seq(
        gen.kw("uline"),
        $.__uline_spec
    ),

    __uline_spec: $ => repeat1(
        choice(
            $.output_position_spec,
            field("modif_id", $.modif_id_spec)
        )
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_COMMENT.html
    comment_element: $ => prec.right(seq(
        gen.kw("comment"),
        gen.chainable_immediate($.comment_spec)
    )),

    // Inner spec of a block element to support chaining.
    comment_spec: $ => seq(
        field("position", $.output_position_spec),
        choice(
            field("text", $.__element_text_variable),
            field("target", $.for_screen_field_spec)
        ),
        repeat(choice(
            field("visible_length", $.visible_length_spec),
            field("modif_id", $.modif_id_spec)
        ))
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_COMMENT.html
    pushbutton_element: $ => seq(
        gen.kw("pushbutton"),
        field("position", $.output_position_spec),
        field("text", $.__element_text_variable),
        field("user_command", $.user_command_spec),
        repeat(choice(
            field("visible_length", $.visible_length_spec),
            field("modif_id", $.modif_id_spec)
        ))
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_LINE.html
    begin_of_line_directive: _ => seq(...gen.kws("begin", "of", "line")),

    screen_position_directive: $ => seq(
        gen.kw("position"),
        field("position", $.output_position_spec),
    ),

    /**
     * Since this only actives an existing element (key 0 to 5) this should
     * be considered a directive rather than an element.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_FUNCTIONKEY.html
     */
    function_key_directive: $ => prec.left(seq(
        ...gen.kws("function", "key"),
        choice(
            // function key: 1, 2...
            seq(
                ":",
                commaSep1(field("key", $.number)),
            ),
            field("key", $.number)
        ),
    )),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_INCLUDE_PARAM.html
    include_parameter_directive: $ => seq(
        ...gen.kws("include", "parameters"),
        field("name", $.identifier),
        repeat(choice(
            field("obligatory", $.obligatory_spec),
            field("modif_id", $.modif_id_spec),
        ))
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_INCLUDE_SELOP.html
    include_select_option_directive: $ => seq(
        ...gen.kws("include", "select-options"),
        field("name", $.identifier),
        repeat(choice(
            field("obligatory", $.obligatory_spec),
            field("intervals", $.no_intervals_spec),
            field("extensions", $.no_extension_spec),
            field("modif_id", $.modif_id_spec),
        ))
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_INCLUDE_COMNT.html
    include_comment_directive: $ => seq(
        ...gen.kws("include", "comment"),
        field("position", $.output_position_spec),
        repeat(choice(
            field("target", $.for_screen_field_spec),
            field("modif_id", $.modif_id_spec),
        ))
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_INCLUDE_PUSHB.html
    include_pushbutton_directive: $ => seq(
        ...gen.kws("include", "pushbutton"),
        field("position", $.output_position_spec),
        field("text", $.__element_text_variable),
        repeat(choice(
            field("user_command", $.user_command_spec),
            field("modif_id", $.modif_id_spec),
        ))
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSELECTION-SCREEN_INCLUDE_BLOCK.html
    include_block_directive: $ => seq(
        ...gen.kws("include", "blocks"),
        field("block", $.identifier),
    ),

    end_of_line_directive: _ => seq(...gen.kws("end", "of", "line")),

    for_screen_field_spec: $ => seq(
        optional(field("text", $.__element_text_variable)),
        ...gen.kws("for", "field"),
        field("field", $.identifier),
    ),

    title_spec: $ => seq(
        gen.kw("title"),
        field("title", choice(
            $.string_literal,
            $.struct_component_selector,
            $.identifier
        ))
    ),

    frame_spec: $ => seq(
        ...gen.kws("with", "frame"),
        optional($.title_spec)
    ),

    nesting_level_spec: $ => seq(
        ...gen.kws("nesting", "level"),
        field("level", $.number)
    ),

    tab_lines_spec: $ => seq(
        gen.kw("for"),
        field("number", $.number),
        gen.kw("lines")
    ),

    default_tab_screen_spec: $ => seq(
        gen.kw("default"),
        optional(seq(
            gen.kw("program"),
            field("program", $.identifier)
        )),
        gen.kw("screen"),
        field("dynnr", $.number)
    ),

    window_spec: _ => seq(...gen.kws("as", "window")),

    /**
     * CALL SELECTION-SCREEN dynnr 
     *      [STARTING AT col1 lin1 
     *      [ENDING   AT col2 lin2]] 
     *      [USING SELECTION-SET variant].
     * 
     * https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPCALL_SELECTION_SCREEN.html
     */
    call_sel_screen_statement: $ => seq(
        ...gen.kws("call", "selection-screen"),
        field("dynnr", $.data_object),
        repeat(choice(
            field("starting_at", $.starting_at_spec),
            field("ending_at", $.ending_at_spec),
            field("selection_set", $.using_selection_set_spec)
        ))

    ),

    /**
     * Addition ...[STARTING AT col2 lin2] {@link call_sel_screen_statement}
     */
    starting_at_spec: $ => seq(
        ...gen.kws("starting", "at"),
        field("column", $.data_object),
        field("line", $.data_object),
    ),

    /**
     * Addition ...[ENDING AT col2 lin2] {@link call_sel_screen_statement}
     */
    ending_at_spec: $ => seq(
        ...gen.kws("ending", "at"),
        field("column", $.data_object),
        field("line", $.data_object),
    ),

    /**
     * Addition ... USING SELECTION-SET variant of {@link call_sel_screen_statement}
     */
    using_selection_set_spec: $ => seq(
        ...gen.kws("using", "selection-set"),
        field("variant", $.data_object),
    ),

    __element_text_variable: $ => choice(
        $.identifier,
        $.struct_component_selector
    ),
}

function commaSep1(rule) {
    return seq(rule, repeat(seq(',', rule)))
}