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
          $.filters_spec,
          $.filter_table_spec,
          $.dynamic_type_spec,
          $.context_spec,
        ),
      ),
    ),

  // f1 = x1 f2 = x2 ...
  filters_spec: $ =>
    prec.right(
      seq(
        gen.kw("filters"),
        repeat1(alias($._data_object_binding, $.filter_binding)),
      ),
    ),

  // FILTER-TABLE ftab
  filter_table_spec: $ =>
    seq(gen.kw("filter-table"), field("value", $.named_data_object)),

  // TYPE (name)
  dynamic_type_spec: $ => seq(gen.kw("type"), field("type", $.dynamic_spec)),

  // CONTEXT con
  context_spec: $ =>
    seq(gen.kw("context"), field("value", $.named_data_object)),
};
