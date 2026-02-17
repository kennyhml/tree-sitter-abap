const gen = require("../core/generators.js")

module.exports = {

    /**
     * Technically obsolete but still used excessively.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPFORM.html 
     */
    form_definition: $ => seq(
        gen.kw("form"),
        field("name", $.identifier),
        repeat(
            choice(
                gen.kw_tagged("tables", $.__form_parameter_list),
                gen.kw_tagged("using", $.__form_parameter_list),
                gen.kw_tagged("changing", $.__form_parameter_list),
                gen.kw_tagged("raising", $.raising_list),
            )
        ),
        ".",
        optional(field("body", alias($.statement_block, $.form_body))),
        gen.kw("endform"),
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
        gen.kw("structure"),
        field("name", $.identifier)
    )

}