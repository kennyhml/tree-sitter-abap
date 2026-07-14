module.exports = {
  /**
   * DEFINE macro.
   *   ... &1 ... &9 ...
   * END-OF-DEFINITION.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDEFINE.html
   */
  macro_definition: $ =>
    seq(
      gen.kw("define"),
      field("name", $.identifier),
      ".",
      optional(field("body", $.statement_block)),
      gen.kw("end-of-definition"),
      ".",
    ),

  /**
   *  macro [p1 p2 ... ].
   *
   * WARN: Only limited usage is supported. In theory, even punctuation
   * and operators can be provided as macro arguments. We will limit the usage
   * to identifiers as placeholders at most, since that is still parseable
   * and probably the most commen use case.
   */
  macro_include: $ =>
    prec.right(
      2,
      seq(field("name", $.identifier), optional($.macro_argument_list), "."),
    ),

  macro_argument_list: $ => prec.right(repeat1($.data_object)),
};
