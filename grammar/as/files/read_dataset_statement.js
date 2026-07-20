module.exports = {
  /**
   * READ DATASET dset INTO dobj [MAXIMUM LENGTH mlen]
   *                              [[ACTUAL] LENGTH alen].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREAD_DATASET.html
   */
  ...gen.periodTerminated("read_dataset_statement", $ =>
    seq(
      ...gen.kws("read", "dataset"),
      field("source", $.data_object),
      gen.kw("into"),
      field("destination", $.writable_expression),
      optional($.dataset_maximum_length_spec),
      optional($.dataset_actual_length_spec),
    ),
  ),

  dataset_maximum_length_spec: $ =>
    seq(...gen.kws("maximum", "length"), field("length", $.data_object)),

  dataset_actual_length_spec: $ =>
    seq(
      optional(gen.kw("actual")),
      gen.kw("length"),
      field("destination", $.receiving_expression),
    ),
};
