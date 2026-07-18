module.exports = {
  /**
   * ... itab[ itab_line ][...]
   *
   * NOTE: This variant of the expression does not allow the OPTIOANAL/DEFAULT ... addition
   * that is allowed inside VALUE and REF expressions.
   *
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENTABLE_EXP_RESULT.html
   */
  table_expression: $ =>
    seq(
      field("subject", $._table_expression_subject),
      token.immediate("["),
      $._itab_line,
      "]",
    ),

  /**
   * ... { itab[ itab_line ][...] }
   *   / { VALUE type( itab[ itab_line ][...][default] ) }
   *   / { REF   type( itab[ itab_line ][...][default] ) } ...
   *
   * Variant of the expression that allows the optional / default additons.
   * Only to be used inside VALUE and REF expressions - semantically it just
   * makes more sense to be part of the table expression and be defined here.
   */
  _table_expression_with_default_additions: $ =>
    alias($.__table_expression_with_default_additions, $.table_expression),

  __table_expression_with_default_additions: $ =>
    seq(
      field("subject", $._table_expression_subject),
      token.immediate("["),
      $._itab_line,
      "]",
      choice($.optional, alias($._table_expr_default, $.default_value)),
    ),

  _table_expression_subject: $ =>
    choice(
      $.named_data_object,
      $.dereference_expression,
      $.table_expression,
    ),

  /**
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENTABLE_EXP_ITAB_LINE.html
   */
  _itab_line: $ => choice($.index_read, $.free_key, $.table_key),

  index_read: $ =>
    seq(
      optional(seq($.index_key, gen.kw("index"))),
      field("index", $.numeric_expression),
    ),

  index_key: $ =>
    seq(gen.kw("key"), field("name", choice($.identifier, $.dynamic_spec))),

  /**
   * ... {DEFAULT def} ...
   *
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENTABLE_EXP_OPTIONAL_DEFAULT.html
   */
  _table_expr_default: $ =>
    seq(gen.kw("default"), field("value", $.general_expression)),
};
