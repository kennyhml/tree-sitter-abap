module.exports = {

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENINLINE_DECLARATIONS.html
    declaration_expression: $ => choice(
        seq(
            choice(...gen.kws("final", "data")),
            gen.immediateTightParens(field("name", $._immediate_identifier))
        ),
        seq(
            gen.kw("field-symbol"),
            gen.immediateTightParens(field("name", $._immediate_field_symbol))
        )
    ),

}