const { kw, kws } = require('../helpers/keywords.js')

module.exports = {

    /**
     * REPORT rep [list_options] 
     *            [MESSAGE-ID mid] 
     *            [DEFINING DATABASE ldb] 
     *            [REDUCED FUNCTIONALITY].
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREPORT.html
     */
    report_statement: $ => seq(
        kw("report"),
        field("name", $.identifier),
        repeat($.__report_statement_addition),
        "."
    ),

    __report_statement_addition: $ => choice(
        $.reduced_functionality_spec,
        $.no_standard_page_heading_spec,
        $.defining_database_spec,
        $.line_size_spec,
        $.line_count_spec,
        $.default_message_class_spec
    ),

    reduced_functionality_spec: $ => seq(...kws("reduced", "functionality")),

    no_standard_page_heading_spec: $ => seq(...kws("no", "standard", "page", "heading")),

    defining_database_spec: $ => seq(
        ...kws("defining", "database"),
        field("logical_database", $.identifier)
    ),

    line_size_spec: $ => seq(
        kw("line-size"),
        field("size", $.number)
    ),

    line_count_spec: $ => seq(
        kw("line-count"),
        field("page_lines", $.number),
        token.immediate("("),
        field("footer_lines", $._immediate_number),
        token.immediate(")")
    ),

    default_message_class_spec: $ => seq(
        kw("message-id"),
        field("id", $.identifier)
    ),
}