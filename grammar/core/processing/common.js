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
            field("from", $.iterate_from_index_spec),
            field("to", $.iterate_to_index_spec),
            field("step", $.iterate_step_spec),
            field("where", $.iteration_cond),
        )
    ),

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

    search_key_components_spec: $ => seq(
        optional(gen.kw("components")), // can be omitted
        field("components", $.itab_comp_spec_list)
    ),

    itab_comp_spec_list: $ => repeat1($.itab_comp_spec),

    itab_comp_spec: $ => seq(
        field("comp", $.itab_comp),
        "=",
        field("value", $.general_expression)
    ),

    /**
     * ... COMPARING {comp1 comp2 ...}|{ALL FIELDS}]
     * 
     * Used in, for example:
     * {@link adjacent_duplicates_spec} @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDELETE_DUPLICATES.html
     */
    comparing_fields_spec: $ => seq(
        gen.kw("comparing"),
        choice(
            seq(...gen.kws("all", "fields")),
            field("components", $.itab_component_list)
        )
    ),

    itab_component_list: $ => repeat1($.itab_comp),

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

}