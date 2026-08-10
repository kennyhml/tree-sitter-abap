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
      field("file", $._simple_operand),
      repeat(
        choice(
          alias($.__set_dataset_position_spec, $.dataset_position_spec),
          alias($.__set_dataset_attributes_spec, $.dataset_attributes_spec),
        ),
      ),
    ),

  __set_dataset_position_spec: $ =>
    seq(
      gen.kw("position"),
      field("position", choice($._simple_operand, $.end_of_file)),
    ),

  end_of_file: _ => seq(...gen.kws("end", "of", "file")),

  __set_dataset_attributes_spec: $ =>
    seq(gen.kw("attributes"), field("attributes", $._simple_operand)),
};
