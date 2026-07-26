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
      field("subject", $.__table_expression_subject),
      token.immediate("["),
      $.__itab_line,
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
    choice(
      seq(
        field("subject", $.__table_expression_subject),
        token.immediate("["),
        $.__itab_line,
        "]",
        $.__table_expression_default_addition,
      ),
      seq(
        field(
          "subject",
          alias(
            $.__table_expression_result_component_selection,
            $.component_selection,
          ),
        ),
        $.__table_expression_default_addition,
      ),
    ),

  // Restrict fallback additions to selector chains rooted in table expressions.
  __table_expression_result_component_selection: $ =>
    prec.left(
      1,
      seq(
        field(
          "subject",
          choice(
            $.table_expression,
            alias(
              $.__table_expression_result_component_selection,
              $.component_selection,
            ),
          ),
        ),
        $.__component_selection_tail,
      ),
    ),

  __table_expression_default_addition: $ =>
    choice($.optional, alias($.__table_expr_default, $.default_value)),

  __table_expression_subject: $ =>
    choice(
      $.named_data_object,
      $.dereference_expression,
      $.table_expression,
    ),

  /**
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENTABLE_EXP_ITAB_LINE.html
   */
  __itab_line: $ =>
    choice($.index_read, $.free_key_spec, $.table_key_spec),

  index_read: $ =>
    seq(
      optional(seq($.index_key_spec, gen.kw("index"))),
      field("index", $.numeric_expression),
    ),

  index_key_spec: $ =>
    seq(gen.kw("key"), field("name", choice($.identifier, $.dynamic_spec))),

  /**
   * ... {DEFAULT def} ...
   *
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENTABLE_EXP_OPTIONAL_DEFAULT.html
   */
  __table_expr_default: $ =>
    seq(gen.kw("default"), field("value", $.general_expression)),
};
