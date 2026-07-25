module.exports = {
  /**
   * CREATE {OBJECT|DATA} ref AREA HANDLE handle ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCREATE_OBJECT_AREA_HANDLE.html
   */
  area_handle_spec: $ =>
    seq(...gen.kws("area", "handle"), field("handle", $.writable_expression)),
};
