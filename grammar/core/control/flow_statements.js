const gen = require("../generators.js")

/**
 * Control statements that interrupt / jump between control flows.
 * 
 * Most of these are extremely short and hardly worth making a dedicated file for.
 */
module.exports = {

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPRETURN.html
    return_statement: $ => seq(
        gen.kw("return"),
        optional(field("expr", $.general_expression)),
        "."
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPEXIT_PROCESSING_BLOCKS.html
    exit_statement: _ => seq(
        gen.kw("exit"),
        "."
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCHECK_PROCESSING_BLOCKS.html
    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCHECK_LOOP.html
    check_statement: $ => seq(
        gen.kw("check"),
        field("condition", $._logical_expression),
        "."
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCONTINUE.html
    continue_statement: _ => seq(gen.kw("continue"), "."),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPRESUME.html
    resume_statement: _ => seq(gen.kw("resume"), "."),
}