/// <reference types="tree-sitter-cli/dsl" />
const gen = require("../core/generators.js")


module.exports = {

    /**
     * ... { OUTPUT } 
     *   | { ON {para|selcrit} } 
     *   | { ON END OF selcrit } 
     *   | { ON BLOCK block } 
     *   | { ON RADIOBUTTON GROUP group } 
     *   | { } 
     *   | { ON {HELP-REQUEST|VALUE-REQUEST} 
     *       FOR {para|selcrit-low|selcrit-high} } 
     *   | { ON EXIT-COMMAND }.
     */
    at_selscreen_statement: $ => prec.right(seq(
        ...gen.kws("at", "selection-screen"),
        optional(field("event", $.__selection_screen_event)),
        ".",
        optional(field("body", $.statement_block))
    )),

    __selection_screen_event: $ => choice(
        $.output,
        $.on_exit_command,
        $.on_radiobutton_group,
        $.on_block,
        $.on_value_request,
        $.on_help_request,
        $.on_parameter,
        $.on_end_of_parameter
    ),

    // { OUTPUT }
    output: _ => gen.kw("output"),

    // { ON EXIT-COMMAND }
    on_exit_command: _ => seq(...gen.kws("on", "exit-command")),

    // { ON RADIOBUTTON GROUP group } 
    on_radiobutton_group: $ => seq(
        ...gen.kws("on", "radiobutton", "group"),
        field("group", $.identifier)
    ),

    // { ON BLOCK block } 
    on_block: $ => seq(
        ...gen.kws("on", "block"),
        field("block", $.identifier)
    ),

    // { ON BLOCK block } 
    on_parameter: $ => seq(
        ...gen.kws("on"),
        field("parameter", $.identifier)
    ),

    // { ON END OF selcrit } 
    on_end_of_parameter: $ => seq(
        ...gen.kws("on", "end", "of"),
        field("select_options", $.identifier)
    ),

    // { ON VALUE-REQUEST }
    //   FOR {para|selcrit-low|selcrit-high} }
    on_value_request: $ => seq(
        ...gen.kws("on", "value-request"),
        $.__help_or_value_request_target
    ),

    // { ON HELP-REQUEST }
    //   FOR {para|selcrit-low|selcrit-high} }
    on_help_request: $ => seq(
        ...gen.kws("on", "help-request"),
        $.__help_or_value_request_target
    ),

    // FOR {para|selcrit-low|selcrit-high}
    __help_or_value_request_target: $ => seq(
        gen.kw("for"),
        field("target", choice(
            $.identifier,
            $.struct_component_selector
        ))
    )

}