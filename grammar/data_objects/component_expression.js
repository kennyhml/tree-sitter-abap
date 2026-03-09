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

    _type_component_expression: $ => alias(
        $.__type_component_expression,
        $.component_expression
    ),

    __type_component_expression: $ => seq(
        // Name of a structure or a structured type that can itself be linked.
        // Functional method call or method chaining with a structured result.
        // Single or chained table expression that returns a structured table line.
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
        field("component", $._immediate_type_identifier)
    ),

}