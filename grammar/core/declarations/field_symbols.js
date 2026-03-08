module.exports = {

    /**
     * FIELD-SYMBOLS <fs> { typing | obsolete_typing }.
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPFIELD-SYMBOLS.html
     */
    ...gen.declaration_and_spec("field-symbols", $ => $.field_symbol),

    field_symbol: $ => seq(
        '<',
        field("name", $._immediate_identifier),
        token.immediate(">")
    ),

    // ... ASSIGNING <fs> / field-symbol(<fs>) [CASTING] [ELSE UNASSIGN] ...
    assigning: $ => seq(
        ...gen.kws("assigning"),
        field("target", choice(
            $.field_symbol,
            $.declaration_expression
        )),
        optional($.casting),
        optional($.else_unassign),
    ),

    else_unassign: _ => seq(...gen.kws("else", "unassign")),

    casting: _ => gen.kw("casting"),

    _immediate_field_symbol: $ => seq(
        token.immediate('<'),
        field("name", $._immediate_identifier),
        token.immediate(">")
    ),

}