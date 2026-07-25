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
          field("result", $.__table_read_non_into_result),
          $.__table_read_variant,
        ),
        seq(
          field(
            "result",
            alias($.__read_table_into_spec, $.into_spec),
          ),
          optional($.__transport_options),
          $.__table_read_variant,
          optional($.__transport_options),
        ),
        seq(
          $.__table_read_key_variant,
          choice(
            field("result", $.__table_read_non_into_result),
            seq(
              field(
                "result",
                alias($.__read_table_into_spec, $.into_spec),
              ),
              optional($.__transport_options),
            ),
          ),
        ),
        seq(
          $.itab_lines_spec,
          choice(
            seq(
              field("result", $.__table_read_non_into_result),
              optional($.itab_lines_spec),
            ),
            seq(
              field(
                "result",
                alias($.__read_table_into_spec, $.into_spec),
              ),
              optional($.__transport_options),
              optional(seq($.itab_lines_spec, optional($.__transport_options))),
            ),
          ),
        ),
      ),
    ),

  __table_read_variant: $ =>
    choice(
      $.index_spec,
      $.itab_lines_spec,
      $.free_key_spec,
      $.table_key_spec,
      $.from_work_area_spec,
    ),

  __table_read_key_variant: $ =>
    choice(
      $.index_spec,
      $.free_key_spec,
      $.table_key_spec,
      $.from_work_area_spec,
    ),

  /**
   * ... { INTO wa [transport_options] }
   *   / { ASSIGNING <fs> [CASTING] [ELSE UNASSIGN] }
   *   / { REFERENCE INTO dref }
   *   / { TRANSPORTING NO FIELDS } ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREAD_TABLE_OUTDESC.html
   */
  __table_read_non_into_result: $ =>
    choice(
      $.assigning_spec,
      $.reference_into_spec,
      alias($._transporting_no_fields_spec, $.transporting_spec),
    ),

  // { INTO wa }
  __read_table_into_spec: $ =>
    seq(
      gen.kw("into"),
      field("work_area", $.writable_expression),
    ),

  __transport_options: $ =>
    repeat1(
      choice(
        $.comparing_spec,
        alias($._transporting_components_spec, $.transporting_spec),
      ),
    ),
};
