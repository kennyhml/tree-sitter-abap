const gen = require('../generators.js');

module.exports = {

    /**
     * Specification of a range table type
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDATA_RANGES.html
     */
    range_type: $ => prec.right(seq(
        choice(
            $.__range_type_spec,
            $.__range_like_spec
        ),
        repeat($.__range_type_addition)
    )),

    // {TYPE RANGE OF type}
    __range_type_spec: $ => seq(
        ...gen.kws("type", "range", "of"),
        field("line_type", choice(
            $._type_identifier,
            $.type_component_selector,
        )),
    ),

    // {LIKE RANGE OF dobj}
    __range_like_spec: $ => seq(
        ...gen.kws("like", "range", "of"),
        field("line_type", choice(
            $.identifier,
            $.data_component_selector,
        )),
    ),

    __range_type_addition: $ => choice(
        $.with_header_line,
        $.initial_value,
        $.read_only,
        $.initial_size,
    )
}