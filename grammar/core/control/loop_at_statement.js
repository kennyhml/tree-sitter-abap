import { kw, kws } from '../../helpers/keywords.js'

export default {

    /**
     * 1. LOOP AT itab result [cond].
     * ...
     * ENDLOOP.
     * 
     * 2. LOOP AT itab result [cond] GROUP BY group_key
     * [ASCENDING|DESCENDING [AS TEXT]]
     * [WITHOUT MEMBERS]
     * [group_result].
     * ...
     * ENDLOOP.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPLOOP_AT_ITAB_VARIANTS.html
     */
    loop_at_statement: $ => seq(
        ...kws("loop", "at"),
        field("subject", $.functional_expression),
        repeat(choice(
            field("result", $.__loop_at_result),
            field("condition", $.iteration_cond),
            $._iteration_index_spec,
        )),
        optional(field("grouping", $.group_by_spec)),
        ".",
        optional(field("body", $.loop_at_body)),
        kw("endloop"), ".",
    ),

    /**
     *
     * LOOP AT GROUP group result [WHERE log_exp] [GROUP BY ...]. 
     *   ... 
     * ENDLOOP.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPLOOP_AT_GROUP.html
     */
    loop_at_group_statement: $ => seq(
        ...kws("loop", "at", "group"),
        field("subject", $.named_data_object),
        repeat(choice(
            field("result", $.__loop_at_result),
            field("condition", $.iteration_cond),
            $._iteration_index_spec,
        )),
        optional(field("grouping", $.group_by_spec)),
        ".",
        optional(field("body", alias($.statement_block, $.loop_at_body))),
        kw("endloop"),
        "."
    ),

    loop_at_body: $ => repeat1(
        choice(
            $._statement,
            $.at_first_statement,
            $.at_new_statement,
            $.at_end_of_statement,
            $.at_last_statement
        )
    ),

    /**
     * Group processing statement block in a {@link loop_at_statement}.
     * 
     * [AT FIRST. 
     * ... 
     * ENDAT.] 
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPAT_ITAB.html
     */
    at_first_statement: $ => seq(
        ...kws("at", "first"), ".",
        optional(field("body", alias($.statement_block, $.body))),
        kw("endat"), "."
    ),

    /**
     * Group processing statement block in a {@link loop_at_statement}.
     * 
     * [AT NEW comp1. 
     * ... 
     * ENDAT.] 
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPAT_ITAB.html
     */
    at_new_statement: $ => seq(
        ...kws("at", "new"),
        field("component", $.itab_comp), ".",
        optional(field("body", alias($.statement_block, $.body))),
        kw("endat"), "."
    ),

    /**
     * Group processing statement block in a {@link loop_at_statement}.
     * 
     * [AT END OF comp1. 
     * ... 
     * ENDAT.] 
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPAT_ITAB.html
     */
    at_end_of_statement: $ => seq(
        ...kws("at", "end", "of"),
        field("component", $.itab_comp), ".",
        optional(field("body", alias($.statement_block, $.body))),
        kw("endat"), "."
    ),

    /**
     * Group processing statement block in a {@link loop_at_statement}.
     * 
     * [AT LAST. 
     * ... 
     * ENDAT.] 
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPAT_ITAB.html
     */
    at_last_statement: $ => seq(
        ...kws("at", "last"), ".",
        optional(field("body", alias($.statement_block, $.body))),
        kw("endat"), "."
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPLOOP_AT_ITAB_RESULT.html
    __loop_at_result: $ => choice(
        $.into_spec,
        $.assigning_spec,
        $.reference_into_spec,
        $.transporting_no_fields_spec
    ),

}