module.exports = {
  /**
   * Static:
   * GET BADI badi [FILTERS f1 = x1 f2 = x2 ...] [CONTEXT con].
   *
   * Dynamic:
   * GET BADI badi TYPE (name)
   *          [FILTERS f1 = x1 f2 = x2 ... | FILTER-TABLE ftab]
   *          [CONTEXT con].
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPGET_BADI.html
   */
  get_badi_statement: $ => seq($.__get_badi_statement_prefix, "."),

  __get_badi_statement_prefix: $ =>
    seq(
      ...gen.kws("get", "badi"),
      field("name", $.named_data_object),
      repeat(
        choice(
          $.badi_filters_spec,
          $.badi_filter_table_spec,
          $.badi_type_spec,
          $.badi_context_spec,
        ),
      ),
    ),

  // f1 = x1 f2 = x2 ...
  badi_filters_spec: $ =>
    prec.right(seq(gen.kw("filters"), repeat1($.badi_filter))),

  // FILTER-TABLE ftab
  badi_filter_table_spec: $ =>
    seq(gen.kw("filter-table"), field("value", $.named_data_object)),

  // f = x, where x is a data object rather than an expression.
  badi_filter: $ =>
    seq(field("name", $.identifier), "=", field("value", $.data_object)),

  // TYPE (name)
  badi_type_spec: $ => seq(gen.kw("type"), field("type", $.dynamic_spec)),

  // CONTEXT con
  badi_context_spec: $ =>
    seq(gen.kw("context"), field("value", $.named_data_object)),
};
