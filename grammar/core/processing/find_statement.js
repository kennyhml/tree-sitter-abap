const gen = require("../generators.js")


module.exports = {

    /**
     * FIND [{FIRST OCCURRENCE}|{ALL OCCURRENCES} OF] pattern
     *   IN [section_of] dobj 
     *   [IN {CHARACTER|BYTE} MODE] 
     *   [find_options].
     * 
     *  https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPFIND.html
     */
    find_statement: $ => seq(
        gen.kw("find"),
        $._pattern_spec,
        field("subject", $.subject_spec),
        repeat($.__find_addition),
        "."
    ),

    /**
     * ...  [{RESPECTING|IGNORING} CASE] 
     *       [MATCH COUNT  mcnt] 
     *       { {[MATCH OFFSET moff] 
     *          [MATCH LENGTH mlen]} 
     *       | [RESULTS result_tab|result_wa] } 
     *       [SUBMATCHES s1 s2 ...] ...
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPFIND_OPTIONS.html
     */
    __find_addition: $ => choice(
        $.case_sensitivity_spec,
        $.string_processing_spec,

        $.match_count_spec,
        $.match_offset_spec,
        $.match_length_spec,
        $.statement_results_spec,

        $.submatches_spec
    ),

    /**
     * Specifies subgroup registers in a {@link find} statement.
     * 
     * `SUBMATCHES s1 s2 ...`
     */
    submatches_spec: $ => prec.right(seq(
        gen.kw("submatches"),
        repeat1($.receiving_expression)
    )),

    // `MATCH COUNT cnt`
    match_count_spec: $ => seq(
        ...gen.kws("match", "count"),
        field("target", $.receiving_expression)
    ),

    // MATCH OFFSET off
    match_offset_spec: $ => seq(
        ...gen.kws("match", "offset"),
        field("target", $.receiving_expression)
    ),

    // MATCH LENGTH len
    match_length_spec: $ => seq(
        ...gen.kws("match", "length"),
        field("target", $.receiving_expression)
    ),
}