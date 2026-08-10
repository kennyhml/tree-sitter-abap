module.exports = {
  /**
   * GET DATASET dset [POSITION pos] [ATTRIBUTES attr].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPGET_DATASET.html
   */
  get_dataset_statement: $ => seq($.__get_dataset_statement_prefix, "."),

  __get_dataset_statement_prefix: $ =>
    seq(
      ...gen.kws("get", "dataset"),
      field("file", $._simple_operand),
      repeat(
        choice(
          alias($.__get_dataset_position_spec, $.dataset_position_spec),
          alias($.__get_dataset_attributes_spec, $.dataset_attributes_spec),
        ),
      ),
    ),

  __get_dataset_position_spec: $ =>
    seq(gen.kw("position"), field("destination", $._result_target)),

  __get_dataset_attributes_spec: $ =>
    seq(gen.kw("attributes"), field("destination", $._result_target)),
};
