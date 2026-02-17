const gen = require("../generators.js")


module.exports = {

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREPLACE.html
    replace_statement: $ => choice(
        $.__pattern_based_replacement,
        $.__position_based_replacement
    ),

    /**
     * REPLACE [{FIRST OCCURRENCE}| {ALL OCCURRENCES} OF] pattern
     *   IN [section_of] dobj WITH new 
     *   [IN {CHARACTER|BYTE} MODE] 
     *   [replace_options].
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREPLACE_IN_PATTERN.html
     */
    __pattern_based_replacement: $ => seq(
        gen.kw("replace"),
        $._pattern_spec,
        field("subject", $.subject_spec),
        field("substitute", alias($.__replace_substitute_spec, $.subject_spec)),
        repeat($.__replace_addition),
        ".",
    ),

    /**
     * REPLACE SECTION [OFFSET off] [LENGTH len] OF dobj WITH new 
     *                 [IN {CHARACTER|BYTE} MODE].
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREPLACE_IN_POSITION.html
     */
    __position_based_replacement: $ => seq(
        gen.kw("replace"),
        field("subject", $.subject_spec),
        field("substitute", alias($.__replace_substitute_spec, $.subject_spec)),
        optional($.string_processing_spec),
        "."
    ),

    __replace_substitute_spec: $ => seq(
        gen.kw("with"),
        field("value", $.data_object),
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREPLACE_OPTIONS.html
    __replace_addition: $ => choice(
        $.verbatim_spec,
        $.string_processing_spec,
        $.case_sensitivity_spec,

        $.replacement_count_spec,
        $.replacement_offset_spec,
        $.replacement_length_spec,

        $.statement_results_spec
    ),

    // `replacement COUNT cnt`
    replacement_count_spec: $ => seq(
        ...gen.kws("replacement", "count"),
        field("target", $.receiving_expression)
    ),

    // replacement OFFSET off
    replacement_offset_spec: $ => seq(
        ...gen.kws("replacement", "offset"),
        field("target", $.receiving_expression)
    ),

    // replacement LENGTH len
    replacement_length_spec: $ => seq(
        ...gen.kws("replacement", "length"),
        field("target", $.receiving_expression)
    ),

    verbatim_spec: _ => gen.kw("verbatim"),
}