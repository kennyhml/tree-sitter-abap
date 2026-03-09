module.exports = {

    /**
     * `dref->*`
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENDEREFERENCING_OPERATOR.html
     */
    dereference_expression: $ => seq(
        field("dref",
            choice(
                $.identifier,
                $.component_expression,
                $.method_call,
                $.new_expression,
                $.table_expression,
                $.cast_expression
            )
        ),
        token.immediate("->*"),
    ),

}