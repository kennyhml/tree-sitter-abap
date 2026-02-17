const gen = require("../generators.js")

module.exports = {

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