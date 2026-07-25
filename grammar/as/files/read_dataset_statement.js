module.exports = {
  /**
   * READ DATASET dset INTO dobj [MAXIMUM LENGTH mlen]
   *                              [[ACTUAL] LENGTH alen].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREAD_DATASET.html
   */
  read_dataset_statement: $ => seq($.__read_dataset_statement_prefix, "."),

  __read_dataset_statement_prefix: $ =>
    seq(
      ...gen.kws("read", "dataset"),
      field("source", $.data_object),
      gen.kw("into"),
      field("destination", $.writable_expression),
      optional($.maximum_length_spec),
      optional($.actual_length_spec),
    ),

  maximum_length_spec: $ =>
    seq(...gen.kws("maximum", "length"), field("length", $.data_object)),

  actual_length_spec: $ =>
    seq(
      optional(gen.kw("actual")),
      gen.kw("length"),
      field("destination", $.receiving_expression),
    ),
};
