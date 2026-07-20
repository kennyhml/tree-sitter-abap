module.exports = {
  /**
   * TRY.
   *   [try_block]
   * [CATCH [BEFORE UNWIND] cx_class1 cx_class2 ... [INTO oref].
   *   [catch_block]]
   * ...
   * [CLEANUP [INTO oref].
   *   [cleanup_block]]
   * ENDTRY.
   *
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPTRY.html
   */
  ...gen.periodTerminated("try_statement", $ =>
    seq(
      gen.kw("try"),
      ".",
      optional(field("body", alias($.statement_block, $.try_block))),
      repeat($.catch_clause),
      optional(field("cleanup", $.cleanup_clause)),
      gen.kw("endtry"),
    ),
  ),

  /**
   * CATCH [BEFORE UNWIND] cx_class1 cx_class2 ... [INTO oref].
   *
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCATCH_TRY.html
   */
  catch_clause: $ =>
    seq(
      gen.kw("catch"),
      optional($.before_unwind),
      field("exceptions", $.catch_exception_list),
      optional($.into_clause),
      ".",
      optional(field("body", alias($.statement_block, $.catch_block))),
    ),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLEANUP.html
  cleanup_clause: $ =>
    seq(
      gen.kw("cleanup"),
      optional($.into_clause),
      ".",
      optional(field("body", alias($.statement_block, $.cleanup_block))),
    ),

  before_unwind: _ => seq(...gen.kws("before", "unwind")),

  catch_exception_list: $ => repeat1($.identifier),
};
