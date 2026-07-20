/**
 * Control statements that interrupt / jump between control flows.
 *
 * Most of these are extremely short and hardly worth making a dedicated file for.
 */
module.exports = {
  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPRETURN.html
  ...gen.periodTerminated("return_statement", $ =>
    seq(gen.kw("return"), optional(field("expr", $.general_expression))),
  ),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPEXIT_PROCESSING_BLOCKS.html
  ...gen.periodTerminated("exit_statement", $ => seq(gen.kw("exit"))),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCHECK_PROCESSING_BLOCKS.html
  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCHECK_LOOP.html
  ...gen.periodTerminated("check_statement", $ =>
    seq(gen.kw("check"), field("condition", $._logical_expression)),
  ),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCONTINUE.html
  ...gen.periodTerminated("continue_statement", $ => seq(gen.kw("continue"))),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPRESUME.html
  ...gen.periodTerminated("resume_statement", $ => seq(gen.kw("resume"))),
};
