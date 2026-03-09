module.exports = {

    /**
     * 1. General Function Module Call
     *    CALL FUNCTION func { parameter_list | parameter_tables }.
     * 
     * 2. Remote Function Call
     *   CALL FUNCTION ... DESTINATION ...
     * 
     * 3. Registration of an Update Task Function Module
     *   CALL FUNCTION update_function IN UPDATE TASK
     *        [EXPORTING p1 = a1 p2 = a2 ...]
     *        [TABLES t1 = itab1 t2 = itab2 ...].
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCALL_FUNCTION.html
     */
    call_function_statement: $ => seq(
        ...gen.kws("call", "function"),
        field("name", $.character_like_expression),
        repeat(choice(
            $.rfc_destination,
            $.in_remote_session,
            $.starting_new_task,
            $.asynchronous_callback,
            $.in_background_unit,
            $.in_background_task,
            $.in_update_task
        )),
        optional($.call_argument_list),
        "."
    ),

    // ... [DESTINATION {dest|{IN GROUP {group|DEFAULT}}}] ...
    rfc_destination: $ => seq(
        gen.kw("destination"),
        choice(
            $.data_object,
            $.in_group
        )
    ),

    // ... {IN GROUP {group|DEFAULT} ...
    in_group: $ => seq(
        ...gen.kws("in", "group"),
        field("group", choice(
            $.named_data_object,
            gen.kw("default")
        ))
    ),

    in_remote_session: $ => seq(
        ...gen.kws("in", "remote", "session"),
        field("session", $.named_data_object)
    ),

    starting_new_task: $ => seq(
        ...gen.kws("starting", "new", "task"),
        field("task_id", $.data_object)
    ),

    asynchronous_callback: $ => seq(
        choice(
            seq(
                gen.kw("calling"),
                field("method", choice(
                    $.identifier,
                    $.component_expression,
                    $.component_expression
                ))
            ),
            seq(
                gen.kw("performing"),
                field("routine", $.identifier)
            )
        ),
        ...gen.kws("on", "end", "of", "task")
    ),

    in_background_unit: $ => seq(
        ...gen.kws("in", "background", "unit"),
        field("unit", $.named_data_object)
    ),

    /**
     * Despite being an obsolete language element, this is still used quite often.
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCALL_FUNCTION_BACKGROUND_TASK.html
     */
    in_background_task: $ => prec.right(seq(
        ...gen.kws("in", "background", "task"),
        optional($.as_seperate_unit),
    )),

    in_update_task: _ => seq(...gen.kws("in", "update", "task"),),

    as_seperate_unit: _ => seq(...gen.kws("as", "separate", "unit"))

}