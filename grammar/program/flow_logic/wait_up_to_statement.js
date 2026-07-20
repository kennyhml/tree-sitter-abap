module.exports = {
  /**
   * WAIT UP TO sec SECONDS.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPWAIT_UP_TO.html
   */
  ...gen.periodTerminated("wait_up_to_statement", $ =>
    seq(
      ...gen.kws("wait", "up", "to"),
      field("seconds", $.numeric_expression),
      gen.kw("seconds"),
    ),
  ),
};
