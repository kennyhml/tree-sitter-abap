module.exports = {
    /**
     * 1. Basic Form:
     * ... FILTER type( itab [EXCEPT] [USING KEY keyname]
     * WHERE c1 op {op f1}|{IS [NOT] INITIAL}
     * [AND c2 op {op f2}|{IS [NOT] INITIAL} [...]] ) ...
     * 
     * 2. Filter Table:
     * ... FILTER type( itab [EXCEPT] IN ftab [USING KEY keyname]
     * WHERE c1 op f1 [AND c2 op f2 [...]] ) ...
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONSTRUCTOR_EXPRESSION_FILTER.html
     */
    filter_expression: $ => seq(
        gen.kw("filter"),
        field("type", $._constructor_result),

        "(",
        field("subject", $.general_expression),

        optional($.except),
        optional($.using_key),
        optional($.in_filter_table),

        $.where_condition,
        ")"
    ),

    in_filter_table: $ => seq(
        gen.kw("in"),
        field("table", $.general_expression),
        optional($.using_key),
    ),

    except: _ => gen.kw("except"),

}