module.exports = {
  /**
   * GET TIME STAMP FIELD time_stamp.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPGET_TIME-STAMP.html
   */
  get_timestamp_statement: $ =>
    seq(
      ...gen.kws("get", "time", "stamp", "field"),
      field("destination", $.writable_expression),
      ".",
    ),
};
