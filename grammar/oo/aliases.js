const gen = require("../core/generators.js")

module.exports = {

    aliases_declaration: $ => gen.chainable("aliases", $.alias_spec),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPALIASES.html
    alias_spec: $ => seq(
        field("alias", $.identifier),
        gen.kw("for"),
        $.interface_component_selector
    ),

}