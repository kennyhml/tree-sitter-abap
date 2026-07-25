module.exports = {
  /**
   * SORT itab [STABLE]
   *      { { [ASCENDING|DESCENDING]
   *          [AS TEXT]
   *          [BY {comp1 [ASCENDING|DESCENDING] [AS TEXT]}
   *              {comp2 [ASCENDING|DESCENDING] [AS TEXT]}
   *              ... ] }
   *      / { [BY (otab)] }
   *      / { [BY expr] } }.
   *
   * Ambiguity exists between a dynamic component specification and a the specification
   * of a sort table.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abapsort_itab.html
   */
  sort_statement: $ => seq($.__sort_statement_prefix, "."),

  __sort_statement_prefix: $ =>
    seq(
      gen.kw("sort"),
      field("subject", $.general_expression),
      optional($.__sort_additions),
    ),

  __sort_additions: $ =>
    seq(
      optional($.stable),
      choice(
        $.by_order_table_spec,
        $.by_sort_component_list_spec,
        seq($.sort_order_spec, optional($.by_sort_component_list_spec)),
        $.as_text,
      ),
    ),

  // { [BY (otab)] }
  by_order_table_spec: $ =>
    seq(
      gen.kw("by"),
      field(
        "order_table",
        choice($.dynamic_spec, $.constructor_expression, $.function_call),
      ),
    ),

  stable: _ => gen.kw("stable"),

  /**
   * ... [BY {comp1[ASCENDING|DESCENDING] [AS TEXT]}
   *         {comp2[ASCENDING|DESCENDING] [AS TEXT]}
   *         ... ] }
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abapsort_itab.html
   */
  by_sort_component_list_spec: $ =>
    prec.right(seq(gen.kw("by"), repeat1($.sort_component_spec))),

  // {comp1 [ASCENDING|DESCENDING] [AS TEXT]}
  sort_component_spec: $ =>
    prec.right(seq(field("comp", $.itab_comp), optional($.sort_order_spec))),
};
