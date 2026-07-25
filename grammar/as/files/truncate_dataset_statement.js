module.exports = {
  /**
   * TRUNCATE DATASET dset AT {CURRENT POSITION}|{POSITION pos}.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPTRUNCATE.html
   */
  truncate_dataset_statement: $ =>
    seq(
      ...gen.kws("truncate", "dataset"),
      field("subject", $.data_object),
      alias($.__truncate_at_position_spec, $.at_position_spec),
    ),

  __truncate_at_position_spec: $ =>
    seq(
      gen.kw("at"),
      choice(
        $.current_position,
        seq(gen.kw("position"), field("position", $.data_object)),
      ),
    ),

  current_position: _ => seq(...gen.kws("current", "position")),
};
