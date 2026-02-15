const { kw, kws } = require('../helpers/keywords.js')

module.exports = {

    /**
     * PERFORM subr(prog) [IF FOUND] [parameter_list].
     */
    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPPERFORM_OBSOLETE.html
    perform_statement: $ => seq(
        kw("perform"),
        field("routine", $.subroutine_spec),
        repeat(
            choice(
                args("tables", $._positional_argument_list),
                args("using", $._positional_argument_list),
                args("changing", $._positional_argument_list)
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

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPPERFORM_ON_COMMIT.html
    subroutine_registration: $ => seq(
        kw("perform"),
        field("name", $.identifier),
        choice(
            seq(...kws("on", "rollback")),
            seq(
                ...kws("on", "commit"),
                optional(seq(
                    kw("level"),
                    field("level", $.data_object)
                ))
            )
        ),
        "."
    ),

    // IN PROGRAM {prog|(pname)} 
    in_program_spec: $ => seq(
        ...kws("in", "program"),
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
        kw("of"),
        field("subroutines", $.subroutine_list)
    ),

    __dyn_or_explicit_spec: $ => choice(
        $.identifier,
        $.dyn_spec
    ),
}

function args(keyword, rule) {
    return field(keyword.replace("-", "_"), seq(kw(keyword), rule));
}