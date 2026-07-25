module.exports = {
  /**
   * TODO: Add tests
   *
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCASE_TYPE.html
   */
  case_type_of_statement: $ => seq($.__case_type_of_statement_prefix, "."),

  __case_type_of_statement_prefix: $ =>
    seq(
      ...gen.kws("case", "type", "of"),
      field("subject", $.general_expression),
      ".",
      repeat(field("alternative", $.case_type_clause)),
      optional(field("others", $.others_case_clause)),
      gen.kw("endcase"),
    ),

  /**
   * [WHEN TYPE class|intf [INTO target2].
   *   [statement_block2]]
   */
  case_type_clause: $ =>
    seq(
      ...gen.kws("when", "type"),
      field("type", $.identifier),
      optional(alias($.__cast_into_spec, $.into_spec)),
      ".",
      field("consequence", optional($.statement_block)),
    ),

  // [INTO target1]
  __cast_into_spec: $ =>
    seq(
      gen.kw("into"),
      field("target", choice($.named_data_object, $.declaration_expression)),
    ),
};
