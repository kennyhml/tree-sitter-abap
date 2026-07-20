module.exports = {
  /**
   * GET DATASET dset [POSITION pos] [ATTRIBUTES attr].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPGET_DATASET.html
   */
  ...gen.periodTerminated("get_dataset_statement", $ =>
    seq(
      ...gen.kws("get", "dataset"),
      field("file", $.data_object),
      repeat(
        choice(
          alias($._get_dataset_position_spec, $.dataset_position_spec),
          alias($._get_dataset_attributes_spec, $.dataset_attributes_spec),
        ),
      ),
    ),
  ),

  _get_dataset_position_spec: $ =>
    seq(gen.kw("position"), field("destination", $.receiving_expression)),

  _get_dataset_attributes_spec: $ =>
    seq(gen.kw("attributes"), field("destination", $.receiving_expression)),
};
