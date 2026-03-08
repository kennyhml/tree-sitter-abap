module.exports = {

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENMETHOD_CALLS.html
    method_call: $ => prec.right(5, seq(
        // only a single identifier allowed for static calls
        choice(
            field("source",
                seq(
                    $.identifier,
                    token.immediate("=>")
                ),
            ),
            field("source",
                seq(
                    choice(
                        $.identifier,
                        $.method_call,
                        $.data_component_selector,
                        $.new_expression,
                        $.cast_expression
                    ),
                    token.immediate("->")
                ),
            ),
        ),
        field("name", $._immediate_identifier),
        $._parenthesized_call_arguments
    )),

    /**
     * ... (meth_name) 
     *    / oref->(meth_name) 
     *    / class=>(meth_name) 
     *    / (class_name)=>(meth_name) 
     *    / (class_name)=>meth ...
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCALL_METHOD_METH_IDENT_DYNA.html
     */
    call_method_statement: $ => seq(
        ...gen.kws("call", "method"),
        field("method", choice(
            $.identifier,
            $.dyn_spec,
            $.object_component_selector,
            $.class_component_selector,
        )),
        optional($.call_argument_list),
        "."
    ),
}