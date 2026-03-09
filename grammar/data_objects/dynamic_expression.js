module.exports = {

    /**
     * ABAP doesnt really have a word for this kind of operation.
     * 
     * This basically accounts for most cases where identifiers can be
     * specified dynamically, such as struct-('foo'), struct-(1), dynamic
     * method calls, etc.
     */
    dynamic_expression: $ => gen.tightParens(
        field("value", choice(
            $._immediate_identifier,
            $._immediate_string_literal,
        )),
        field("offset", $._immediate_number),
    ),

    _immediate_dynamic_expression: $ => alias(gen.immediateTightParens(
        field("value", choice(
            $._immediate_identifier,
            $._immediate_string_literal,
        )),
        field("offset", $._immediate_number),
    ), $.dynamic_expression),
}