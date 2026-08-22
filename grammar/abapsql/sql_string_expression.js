module.exports = {
  /**
   * ... sql_elem1 && sql_elem2  [&& sql_elem3 ... ] ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENSQL_STRING.html
   */
  _sql_string_expression: $ =>
    prec.right(
      seq(
        field("left", $._sql_expression),
        "&&",
        field("right", $._sql_expression),
      ),
    ),
};
