module.exports = {
  /**
   * READ TABLE itab result { table_key
   *                         / free_key
   *                         / where_cond
   *                         / index }
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREAD_TABLE.html
   */
  read_table_statement: $ =>
    seq(
      ...gen.kws("read", "table"),
      field("subject", $.functional_expression),
      choice(
        seq(field("result", $.__table_read_result), $.__table_read_variant),
        seq($.__table_read_variant, field("result", $.__table_read_result)),
      ),
      ".",
    ),

  __table_read_variant: $ =>
    choice($.index, $.itab_lines, $.with_table_key, $.from_work_area),

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
      $.transporting_no_fields_spec,
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
};
