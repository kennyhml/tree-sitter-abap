module.exports = {
  /**
   * SET DATASET dset [POSITION {pos|END OF FILE}] [ATTRIBUTES attr].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSET_DATASET.html
   */
  set_dataset_statement: $ => seq($.__set_dataset_statement_prefix, "."),

  __set_dataset_statement_prefix: $ =>
    seq(
      ...gen.kws("set", "dataset"),
      field("file", $.data_object),
      repeat(
        choice(
          alias($._set_dataset_position_spec, $.dataset_position_spec),
          alias($._set_dataset_attributes_spec, $.dataset_attributes_spec),
        ),
      ),
    ),

  _set_dataset_position_spec: $ =>
    seq(
      gen.kw("position"),
      field("position", choice($.data_object, $.end_of_file)),
    ),

  end_of_file: _ => seq(...gen.kws("end", "of", "file")),

  _set_dataset_attributes_spec: $ =>
    seq(gen.kw("attributes"), field("attributes", $.data_object)),
};
