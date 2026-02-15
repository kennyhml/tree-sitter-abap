const { kw, kws } = require("../../helpers/keywords.js")


module.exports = {

    /**
     * CONCATENATE {dobj1 dobj2 ...}|{LINES OF itab} 
     *   INTO result 
     *   [IN {CHARACTER|BYTE} MODE] 
     *   [SEPARATED BY sep] 
     *   [RESPECTING BLANKS].
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCONCATENATE.html
     */
    concatenate_statement: $ => seq(
        kw("concatenate"),
        field("subject", $.__concat_subject_spec),
        field("result", $.__concat_result_spec),
        repeat(choice($.__concat_addition)),
        "."
    ),

    respecting_blanks_spec: _ => seq(...kws("respecting", "blanks")),

    separated_by_spec: $ => seq(
        ...kws("separated", "by"),
        field("separator", $.character_like_expression)
    ),

    data_object_list: $ => prec.right(repeat1($.data_object)),

    __concat_addition: $ => choice(
        $.string_processing_spec,
        $.separated_by_spec,
        $.respecting_blanks_spec

    ),

    __concat_subject_spec: $ => choice(
        $.data_object_list,
        $.lines_of,
    ),

    __concat_result_spec: $ => alias(seq(
        kw("into"),
        field("target", $.receiving_expression)
    ), $.result_spec),
}