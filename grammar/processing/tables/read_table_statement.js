module.exports = {
  /**
   * READ TABLE itab result { table_key
   *                         / free_key
   *                         / where_cond
   *                         / index }
   *
   * WARN: Parts of the statment can be split and the official specification does
   * not suggest that. For example, the read key spec does not necessarily appear
   * in front of the WHERE clause and may have the result in between.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREAD_TABLE.html
   */
  read_table_statement: $ => seq($.__read_table_statement_prefix, "."),

  __read_table_statement_prefix: $ =>
    seq(
      ...gen.kws("read", "table"),
      field("subject", $.functional_expression),
      choice(
        seq(
          field("result", $.__table_read_result),
          $.__table_read_variant,
          optional($.__transport_options),
        ),
        seq(
          choice($.index, $.free_key, $.table_key, $.from_work_area),
          field("result", $.__table_read_result),
        ),
        seq(
          $.itab_lines,
          field("result", $.__table_read_result),
          optional(seq($.itab_lines, optional($.__transport_options))),
        ),
      ),
    ),

  __table_read_variant: $ =>
    choice($.index, $.itab_lines, $.free_key, $.table_key, $.from_work_area),

  /**
   * ... { INTO wa [transport_options] }
   *   / { ASSIGNING <fs> [CASTING] [ELSE UNASSIGN] }
   *   / { REFERENCE INTO dref }
   *   / { TRANSPORTING NO FIELDS } ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREAD_TABLE_OUTDESC.html
   */
  __table_read_result: $ =>
    choice(
      $.assigning,
      $.reference_into,
      $.transporting_no_fields,
      $.into_work_area,
    ),

  /**
   *  ... [TRANSPORTING { {comp1 comp2 ...}|{ALL FIELDS} }] ...
   */
  transporting_components: $ =>
    seq(
      gen.kw("transporting"),
      choice($.all_fields, prec.right(repeat1($.itab_comp))),
    ),

  // { INTO wa [transport_options] }
  into_work_area: $ =>
    seq(
      gen.kw("into"),
      field("work_area", $.writable_expression),
      optional($.__transport_options),
    ),

  __transport_options: $ =>
    repeat1(choice($.comparing, $.transporting_components)),

  transporting_no_fields: $ => seq(...gen.kws("transporting", "no", "fields")),
};
