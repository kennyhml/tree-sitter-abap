const gen = require("../generators.js")

module.exports = {

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSPLIT.html
    split_statement: $ => seq(
        gen.kw("split"),
        field("subject", $.character_like_expression),
        field("split_at", $.split_at_spec),
        field("result", $.split_result_spec),
        optional($.string_processing_spec),
        "."
    ),

    split_at_spec: $ => seq(
        gen.kw("at"),
        field("separator", $.data_object)
    ),

    /**
     * `INTO { {result1 result2 [...]} | {TABLE result_tab} }`
     */
    split_result_spec: $ => prec.right(seq(
        gen.kw("into"),
        choice(
            repeat1($.receiving_expression),
            $.split_table_result_spec,
        )
    )),

    split_table_result_spec: $ => seq(
        gen.kw("table"),
        field("target", $.receiving_expression)
    ),
}