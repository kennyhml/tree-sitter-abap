module.exports = {
  /**
   * EXEC SQL.
   *   native_sql_statement
   * ENDEXEC.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abapexec.html
   */
  exec_sql_statement: $ =>
    seq(
      gen.kw("exec"),
      gen.kw("sql"),
      optional(
        seq(gen.kw("performing"), field("routine", $.identifier)),
      ),
      ".",
      optional(field("body", $.exec_sql_body)),
      gen.kw("endexec"),
      ".",
    ),
};
