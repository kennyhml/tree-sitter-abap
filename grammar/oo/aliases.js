import { chainable } from "../helpers/decl_gen.js"
import { kw } from "../helpers/keywords.js"

export default {

    aliases_declaration: $ => chainable("aliases", $.alias_spec),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPALIASES.html
    alias_spec: $ => seq(
        field("alias", $.identifier),
        kw("for"),
        $.interface_component_selector
    ),

}