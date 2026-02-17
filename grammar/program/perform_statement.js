const gen = require("../core/generators.js")

module.exports = {

    /**
     * PERFORM subr(prog) [IF FOUND] [parameter_list].
     */
    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPPERFORM_OBSOLETE.html
    perform_statement: $ => seq(
        gen.kw("perform"),
        field("routine", $.subroutine_spec),
        repeat(
            choice(
                $.perform_on_commit_spec,
                $.perform_on_rollback_spec,
                gen.kw_tagged("tables", $._positional_argument_list),
                gen.kw_tagged("using", $._positional_argument_list),
                gen.kw_tagged("changing", $._positional_argument_list)
            )
        ),
        "."
    ),

    /**
     * Specification of a subroutine (FORM)
     * 
     * ... subr 
     * | {subr|(sname) IN PROGRAM {prog|(pname)} [IF FOUND]} 
     * | {n OF subr1 subr2 ...} ...
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPPERFORM_FORM.html
     */
    subroutine_spec: $ => choice(
        field("name", $.identifier),
        $.__dynamic_subroutine_spec,
        $.__long_form_subroutine_spec,
        $.__index_subroutine_spec
    ),

    // ... ON ROLLBACK  ...
    perform_on_rollback_spec: _ => seq(...gen.kws("on", "rollback")),

    // ... ON {COMMIT [LEVEL idx]} ...
    perform_on_commit_spec: $ => seq(
        ...gen.kws("on", "commit"),
        optional(field("commit_level", $.commit_level_spec))
    ),

    // LEVEL idx
    commit_level_spec: $ => seq(
        gen.kw("level"),
        field("level", $.data_object)
    ),

    // IN PROGRAM {prog|(pname)} 
    in_program_spec: $ => seq(
        ...gen.kws("in", "program"),
        field("name", $.__dyn_or_explicit_spec),
    ),

    subroutine_list: $ => repeat1($.identifier),

    // PERFORM subr(prog) IF FOUND. 
    __dynamic_subroutine_spec: $ => seq(
        field("name", $.identifier),
        field("program", alias($._immediate_dyn_spec, $.dyn_spec)),
        optional($.if_found_spec)
    ),

    // PERFORM (subr) IN PROGRAM (prog) IF FOUND. 
    __long_form_subroutine_spec: $ => seq(
        field("name", $.__dyn_or_explicit_spec),
        $.in_program_spec,
        optional($.if_found_spec)
    ),

    // PERFORM n OF subr1 subr2
    __index_subroutine_spec: $ => seq(
        field("index", $.data_object),
        gen.kw("of"),
        field("subroutines", $.subroutine_list)
    ),

    __dyn_or_explicit_spec: $ => choice(
        $.identifier,
        $.dyn_spec
    ),
}