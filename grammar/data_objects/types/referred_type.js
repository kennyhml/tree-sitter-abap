

module.exports = {

    /**
     * Specification of a type by referring to another type (declared elsewhere or in DDIC)
     * 
     * DATA var { {TYPE [LINE OF] type} 
     *          / {LIKE [LINE OF] dobj} } 
     *          [VALUE val|{IS INITIAL}]
     *          [READ-ONLY].
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDATA_REFERRING.html
     */
    referred_type: $ => prec.right(seq(
        choice(
            $.__referred_type_type_spec,
            $.__referred_type_like_spec
        ),
        repeat($.__referred_type_addition)
    )),

    __line_of_type: $ => seq(
        ...gen.kws("line", "of"),
        field("subject", choice(
            $.identifier,
            $.component_expression
        ))
    ),

    __line_of_dobj: $ => seq(
        ...gen.kws("line", "of"),
        field("subject", choice(
            $.identifier,
            $.component_expression
        ))
    ),

    __referred_type_addition: $ => choice(
        $.default_data_value,
        $.read_only,
    ),

    // {TYPE [LINE OF] type}
    __referred_type_type_spec: $ => seq(
        gen.kw("type"),
        choice(
            alias($.__line_of_type, $.line_of),
            field("name", choice(
                $.identifier,
                $.component_expression
            ))
        )
    ),

    // {LIKE [LINE OF] dobj}
    __referred_type_like_spec: $ => seq(
        gen.kw("like"),
        choice(
            alias($.__line_of_dobj, $.line_of),
            field("name", choice(
                $.identifier,
                $.component_expression
            ))
        )
    ),
}