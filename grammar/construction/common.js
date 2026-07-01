

module.exports = {

    /**
     * Modifiers for the evaluation of {@link table_expression} inside 
     * e.g {@link value_expression} and {@link ref_expression}.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENTABLE_EXP_OPTIONAL_DEFAULT.html
     */
    _table_expr_default: $ => choice(
        gen.kw("optional"),
        seq(
            gen.kw("default"),
            field("default", $.general_expression)
        )
    ),
}