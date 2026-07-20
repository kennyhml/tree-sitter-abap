module.exports = {
  /**
   * LOG-POINT ID group
   * [SUBKEY sub]
   * [FIELDS val1 val2 ...].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPLOG-POINT.html
   */
  ...gen.periodTerminated("logpoint_statement", $ =>
    seq(
      gen.kw("log-point"),
      $.checkpoint_id_spec,
      optional($.checkpoint_fields_spec),
    ),
  ),
};
