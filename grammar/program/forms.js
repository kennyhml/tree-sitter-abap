import { kw, kws } from '../helpers/keywords.js'

export default {

    /**
     * Technically obsolete but still used excessively.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPFORM.html 
     */
    form_definition: $ => seq(
        kw("form"),
        field("name", $.identifier),
        repeat(
            choice(
                params("tables", $.__form_parameter_list),
                params("using", $.__form_parameter_list),
                params("changing", $.__form_parameter_list),
                params("raising", $.raising_list),
            )
        ),
        ".",
        optional(field("body", alias($.statement_block, $.form_body))),
        kw("endform"),
        "."
    ),

    __form_parameter_list: $ => alias(seq(
        repeat1(
            alias($.__form_parameter, $.parameter)
        ),
    ), $.parameter_list),

    /**
     * Specialized parameter rule for forms. Most of these rules are reused
     * from the methods rules.
     * 
     * TODO: Extract these to some common place?
     */
    __form_parameter: $ => prec.right(seq(
        choice(
            $.simple_param_spec,
            $.value_param_spec,
        ),
        optional(choice(
            field("typing", $._typing),
            $.structure_param_spec
        ))
    )),

    structure_param_spec: $ => seq(
        kw("structure"),
        field("name", $.identifier)
    )

}

function params(keyword, rule) {
    return field(keyword, seq(kw(keyword), rule));
}