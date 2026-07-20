module.exports = {
  /**
   * TEST-SEAM seam.
   *   [statement_block]
   * END-TEST-SEAM.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPTEST-SEAM.html
   */
  ...gen.periodTerminated("test_seam_statement", $ =>
    seq(
      gen.kw("test-seam"),
      field("name", $.identifier),
      ".",
      optional(field("body", $.statement_block)),
      gen.kw("end-test-seam"),
    ),
  ),

  /**
   * TEST-INJECTION seam.
   *   [statement_block]
   * END-TEST-INJECTION.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPTEST-INJECTION.html
   */
  ...gen.periodTerminated("test_injection_statement", $ =>
    seq(
      gen.kw("test-injection"),
      field("name", $.identifier),
      ".",
      optional(field("body", $.statement_block)),
      gen.kw("end-test-injection"),
    ),
  ),
};
