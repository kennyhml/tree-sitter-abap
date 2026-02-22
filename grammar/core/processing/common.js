const gen = require("../generators.js")

module.exports = {

    /**
     * Specifies which lines of an internal table to consider for various expressions.
     * 
     *  ... [USING KEY keyname] 
     *      [FROM idx1] [TO idx2] [STEP n] 
     *      [WHERE log_exp |(cond_syntax)] ...
     * 
     * Used in:
     * 
     * {@link delete_itab_statement} @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDELETE_ITAB_LINES.html
     * {@link loop_at_statement}     @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPLOOP_AT_ITAB_COND.html
     */
    itab_lines_spec: $ => repeat1(
        choice(
            field("from", $.lines_from),
            field("to", $.lines_to),
            field("step", $.lines_step),
            field("where", $.iteration_cond),
        )
    ),

    /**
     *  ... {LINES OF jtab [FROM idx1] [TO idx2] [STEP n] [USING KEY keyname]} ...
     * 
     * Needs to be left associative due to append statement (both use TO ... )
     * 
     * Used in:
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPAPPEND_LINESPEC.html
     */
    lines_of: $ => seq(
        ...gen.kws("lines", "of"),
        field("subject", $.general_expression),
        repeat(
            choice(
                field("from", $.lines_from),
                field("to", $.lines_to),
                field("step", $.lines_step),
                field("key", $.using_key_spec)
            )
        )
    ),

    /**
     * ... wa 
     *     | {INITIAL LINE} 
     *     | {LINES OF jtab [FROM idx1] [TO idx2] [STEP n] [USING KEY keyname]} ...
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPINSERT_ITAB_LINESPEC.html
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPAPPEND_LINESPEC.html
     */
    _line_spec: $ => choice(
        $.general_expression,
        $.initial_line,
        $.lines_of,
    ),

    lines_from: $ => seq(
        gen.kw("from"),
        field("index", $.numeric_expression)
    ),

    lines_to: $ => seq(
        gen.kw("to"),
        field("index", $.numeric_expression),
    ),

    lines_step: $ => seq(
        gen.kw("step"),
        field("size", $.numeric_expression),
    ),

    /**
     * ASCENDING|DESCENDING [AS TEXT]
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPLOOP_AT_ITAB_GROUP_BY.html
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abapsort_itab.html
     */
    sort_order: $ => seq(
        field("direction", choice(
            $.ascending,
            $.descending,
        )),
        optional($.as_text)
    ),

    /**
     * Not sure if this needs to stay here or can be moved to sort statement.
     * 
     * ... [BY {comp1[ASCENDING|DESCENDING] [AS TEXT]} 
     *         {comp2[ASCENDING|DESCENDING] [AS TEXT]} 
     *         ... ] } 
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abapsort_itab.html
     */
    sort_component_list: $ => prec.right(seq(
        gen.kw("by"),
        repeat1($.sort_component)
    )),

    // {comp1 [ASCENDING|DESCENDING] [AS TEXT]}
    sort_component: $ => prec.right(seq(
        field("comp", $.itab_comp),
        optional($.sort_order)
    )),

    as_text: _ => seq(...gen.kws("as", "text")),

    ascending: _ => gen.kw("ascending"),

    descending: _ => gen.kw("descending"),

    /**
     * Specifies an index for various expressions.
     * 
     * ... INDEX idx [USING KEY key] ...
     */
    itab_index_spec: $ => seq(
        gen.kw("index"),
        field("index", $.numeric_expression),
        optional(field("key", $.using_key_spec))
    ),

    /**
     * Specifies a work area to find a line of an internal table from.
     * 
     * ... { FROM wa [USING KEY keyname] } ...
     * 
     * Used in, for example:
     * {@link delete_itab_key_spec} @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREAD_TABLE_KEY.html
     */
    itab_work_area_spec: $ => seq(
        gen.kw("from"),
        field("work_area", $.general_expression),
        optional(field("key", $.using_key_spec))
    ),

    /**
     * Specifies a table key to read from an internal table
     * 
     *  {TABLE KEY [keyname COMPONENTS] 
     *             {comp_name1|(name1)} = operand1 
     *             {comp_name2|(name2)} = operand2 
     *              ...                             } ...
     * 
     * Alternative to {@link itab_work_area_spec}
     */
    itab_table_key_spec: $ => seq(
        optional(seq(
            ...gen.kws(optional("with"), optional("table"), "key"),
            optional(field("key_name", $.identifier)),
        )),
        $.search_key_components_spec,
    ),


    initial_line: $ => seq(
        ...gen.kws("initial", "line")
    ),

    search_key_components_spec: $ => seq(
        optional(gen.kw("components")), // can be omitted
        field("components", $.itab_comp_spec_list),
        optional($.binary_search)
    ),

    itab_comp_spec_list: $ => prec.right(repeat1($.itab_comp_spec)),

    itab_comp_spec: $ => seq(
        field("comp", $.itab_comp),
        "=",
        field("value", $.general_expression)
    ),

    /**
     * ... COMPARING {comp1 comp2 ...}|{ALL FIELDS}/{NO FIELDS}]
     * 
     * Used in, for example:
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDELETE_DUPLICATES.html
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREAD_TABLE_TRANSPORT_OPTIONS.html
     */
    comparing_fields_spec: $ => seq(
        gen.kw("comparing"),
        choice(
            $.all_fields,
            $.no_fields,
            field("components", $.itab_component_list)
        )
    ),

    itab_component_list: $ => prec.right(repeat1($.itab_comp)),

    /**
     * Specification of the processing mode (byte | character) for various statements.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENSTRING_PROCESSING_STATEMENTS.html
     */
    string_processing_spec: _ => seq(
        gen.kw("in"),
        field("mode", choice(...gen.kws("character", "byte"))),
        gen.kw("mode")
    ),


    _pattern_spec: $ => choice(
        $.first_occurrence_of_pattern_spec,
        $.all_occurrences_of_pattern_spec,
        field("pattern", $.__pattern)
    ),

    subject_spec: $ => seq(
        gen.kw("in"),
        optional($.section_spec),
        field("data_object", $.data_object)
    ),

    /**
     * ... {FIRST OCCURRENCE} OF ...
     * 
     * Used in {@link find_statement} and {@link replace_statement}
     */
    first_occurrence_of_pattern_spec: $ => seq(
        ...gen.kws("first", "occurrence", "of"),
        field("pattern", $.__pattern)
    ),

    /**
     * ... {ALL OCCURRENCES} OF ...
     * 
     * Used in {@link find_statement} and {@link replace_statement}
     */
    all_occurrences_of_pattern_spec: $ => seq(
        ...gen.kws("all", "occurrences", "of"),
        field("pattern", $.__pattern)
    ),

    /**
     * 
     * ... SECTION [OFFSET off] [LENGTH len] OF ...
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPFIND_SECTION_OF.html
     */
    section_spec: $ => seq(
        gen.kw("section"),
        repeat(choice(
            field("offset", $.section_offset_spec),
            field("length", $.section_length_spec),
        )),
        gen.kw("of"),
    ),

    section_offset_spec: $ => seq(
        gen.kw("offset"), field("amount", $.numeric_expression)
    ),

    section_length_spec: $ => seq(
        gen.kw("length"), field("amount", $.numeric_expression)
    ),

    /**
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREPLACE_PATTERN.html
     */
    __pattern: $ => choice(
        $.substring_spec,
        $.pcre_spec,
        $.regex_spec,
    ),

    substring_spec: $ => seq(optional(gen.kw("substring")), field("value", $.data_object)),
    pcre_spec: $ => seq(gen.kw("pcre"), field("value", $.data_object)),
    regex_spec: $ => seq(gen.kw("regex"), field("value", $.data_object)),

    /**
     * Specification of a case sensitivity in various string operations.
     * 
     * `RESPECTING/IGNORING CASE`
     */
    case_sensitivity_spec: _ => seq(
        field("case", choice(...gen.kws("respecting", "ignoring"))),
        gen.kw("case")
    ),

    /**
     * Specifies a target variable to safe the individual operations to.
     * 
     * RESULTS result_tab|result_wa
     */
    statement_results_spec: $ => seq(
        gen.kw("results"),
        field("target", $.receiving_expression)
    ),

    binary_search: _ => seq(
        ...gen.kws("binary", "search")
    ),

    all_fields: _ => seq(
        ...gen.kws("all", "fields")
    ),

    no_fields: _ => seq(
        ...gen.kws("no", "fields")
    ),

}