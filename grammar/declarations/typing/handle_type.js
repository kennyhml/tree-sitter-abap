module.exports = {
  /**
   * TYPE HANDLE handle
   *
   * Common statement found only in RTTS context and not part of general typing.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCREATE_DATA_HANDLE.html
   */
  handle_type: $ =>
    seq(...gen.kws("type", "handle"), field("name", $.expression)),
};
