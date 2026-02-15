const { kw } = require('../helpers/keywords.js')
const { chainable } = require('../helpers/decl_gen.js')

module.exports = {

    interface_statement: $ => choice(
        $.interface_definition,
        $.deferred_interface_definition,
        $.interfaces_declaration,
    ),

    interfaces_declaration: $ => chainable("interfaces", $.identifier),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPINTERFACE.html
    interface_definition: $ => seq(
        kw("interface"),
        field("name", $.identifier),
        optional($.public_spec),
        ".",
        optional($.interface_body),
        kw("endinterface"), "."
    ),

    // no public / protected / private sections in interfaces, all public.
    interface_body: $ => repeat1(
        $._class_component
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS_DEFERRED.html
    deferred_interface_definition: $ => seq(
        kw("interface"),
        field("name", $.identifier),
        kw("deferred"),
        optional($.public_spec),
        "."
    ),
}