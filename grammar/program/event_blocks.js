const gen = require('../core/generators.js')



module.exports = {

    /**
     * INITIALIZATION.
     *     [ ... ]
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPINITIALIZATION.html
     */

    initialization_event: $ => prec.right(seq(
        gen.kw("initialization"),
        ".",
        optional(field("body", $.statement_block))
    )),

    /**
     * INITIALIZATION.
     *     [ ... ]
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSTART-OF-SELECTION.html
     */

    start_of_selection_event: $ => prec.right(seq(
        gen.kw("start-of-selection"),
        ".",
        optional(field("body", $.statement_block))
    ))
}