const gen = require("../core/generators.js")

module.exports = {

    interfaces_declaration: $ => gen.chainable("interfaces", $.identifier),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPINTERFACE.html
    interface_definition: $ => seq(
        gen.kw("interface"),
        field("name", $.identifier),
        optional($.public_spec),
        ".",
        optional($.interface_body),
        gen.kw("endinterface"), "."
    ),

    // no public / protected / private sections in interfaces, all public.
    interface_body: $ => repeat1(
        $._class_component
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS_DEFERRED.html
    deferred_interface_definition: $ => seq(
        gen.kw("interface"),
        field("name", $.identifier),
        gen.kw("deferred"),
        optional($.public_spec),
        "."
    ),
}