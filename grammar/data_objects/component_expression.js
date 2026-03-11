module.exports = {

    /**
     * An expression in which a component is selected.
     * The ABAP keyword docs call this a 'component selector' operator.
     * 
     * In favor of simplicity, state count and readability, it appears better
     * to parse them as one rule with the only difference being the operator.
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENSTRUCTURE_COMPONENT_SELECTOR.html
     */
    component_expression: $ => seq(
        field("subject",
            choice(
                $.identifier,
                $.field_symbol,
                $.component_expression,
                $.method_call,
                $.table_expression,
                $.new_expression,
                $.cast_expression,
                $.dynamic_expression
            )
        ),
        field("operator", choice(
            token.immediate("-"),
            token.immediate("->"),
            token.immediate("=>"),
            token.immediate("~"),
        )),
        field("component",
            choice(
                $.dynamic_expression,
                $._immediate_identifier
            )
        )
    ),
}