

module.exports = {

    /**
     * Specification of a reference to a data object.
     * 
     * ... ref { {TYPE REF TO type} 
     *         / {LIKE REF TO dobj} }
     *         [VALUE IS INITIAL]
     *         [READ-ONLY].
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDATA_REFERENCES.html
     */
    reference_type: $ => prec.right(seq(
        choice(
            $.__reference_type_type_spec,
            $.__reference_referred_type_like_spec
        ),
        repeat($.__reference_type_addition)
    )),

    _ref_to_type: $ => seq(
        ...gen.kws("ref", "to"),
        field("subject", choice(
            $._type_identifier,
            $.type_component_selector
        ))
    ),

    _ref_to_data: $ => seq(
        ...gen.kws("ref", "to"),
        field("subject", choice(
            $.identifier,
            $.data_component_selector
        ))
    ),

    __reference_type_addition: $ => choice(
        $.read_only,
        $.initial_value
    ),

    // {TYPE REF TO type}
    __reference_type_type_spec: $ => seq(
        gen.kw("type"),
        alias($._ref_to_type, $.ref_to)
    ),

    // {LIKE REF TO dobj}
    __reference_referred_type_like_spec: $ => seq(
        gen.kw("like"),
        alias($._ref_to_data, $.ref_to)
    ),

}