


/**
 * Variants of FOR, Table Iterations
 * 
 * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENFOR_ITAB.html
 */
module.exports = {

  table_iteration: $ => seq(
    gen.kw("for"),
    choice(
      $.__read_itab_lines,
      $.__group_itab_lines,
      // TODO: Read groups (3rd variant)
    ),
    optional($.let_expression)
  ),

  /**
   * ... FOR wa|<fs> IN itab [INDEX INTO idx] [cond]
   * 
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENFOR_IN_ITAB.html
   */
  __read_itab_lines: $ => seq(
    field("work_area", $.named_data_object),
    gen.kw("in"),
    field("subject", $.general_expression),
    repeat(choice(
      $.itab_lines,
      $.index_into
    ))
  ),

  /**
   * ... FOR GROUPS [group|<group>] OF wa|<fs> IN itab
   *     [INDEX INTO idx] [cond]
   *     GROUP BY group_key
   *     [ASCENDING|DESCENDING [AS TEXT]]
   *     [WITHOUT MEMBERS] ...
   * 
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENFOR_GROUPS_OF.html
   */
  __group_itab_lines: $ => seq(
    $.for_groups,
    $.grouping_work_area,
    $.grouping_subject,
    $.group_by,
  ),

  index_into: $ => seq(
    ...gen.kws("index", "into"),
    field("enumerator", $.identifier)
  ),

  for_groups: $ => seq(
    ...gen.kws("for", "groups"),
    field("variable", $.named_data_object),
  ),

  grouping_work_area: $ => seq(
    gen.kw("of"),
    field("work_area", $.named_data_object),
  ),

  grouping_subject: $ => seq(
    gen.kw("in"),
    field("subject", $.general_expression),
    repeat(choice(
      $.itab_lines,
      $.index_into
    ))
  )
}
