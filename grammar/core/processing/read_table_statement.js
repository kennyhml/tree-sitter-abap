const gen = require("../generators.js")

module.exports = {

    /**
     * READ TABLE itab result { table_key 
     *                         / free_key
     *                         / where_cond
     *                         / index }
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREAD_TABLE.html
     */
    read_table_statement: $ => seq(
        ...gen.kws("read", "table"),
        field("subject", $.functional_expression),
        choice(
            seq(
                field("result", $.__table_read_result),
                $.__table_read_variant,
            ),
            seq(
                $.__table_read_variant,
                field("result", $.__table_read_result),
            )
        ),
        "."
    ),

    __table_read_variant: $ => choice(
        $.itab_index_spec,
        $.iteration_cond,
        $.itab_table_key_spec,
        $.itab_work_area_spec
    ),

    /**
     * ... { INTO wa [transport_options] } 
     *   / { ASSIGNING <fs> [CASTING] [ELSE UNASSIGN] } 
     *   / { REFERENCE INTO dref } 
     *   / { TRANSPORTING NO FIELDS } ...
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREAD_TABLE_OUTDESC.html
     */
    __table_read_result: $ => choice(
        $.assigning,
        $.reference_into,
        $.transporting_no_fields_spec,
        $.read_into_work_area
    ),

    /**
     *  ... [TRANSPORTING { {comp1 comp2 ...}|{ALL FIELDS} }] ...
     */
    transporting_components: $ => seq(
        gen.kw("transporting"),
        choice(
            $.all_fields,
            field("components", $.itab_component_list)
        )
    ),

    // { INTO wa [transport_options] } 
    read_into_work_area: $ => seq(
        gen.kw("into"),
        field("work_area", $.writable_expression),
        optional(field("transport_option", $.__transport_options))
    ),

    __transport_options: $ => repeat1(
        choice(
            $.comparing_fields_spec,
            $.transporting_components
        )
    ),
}