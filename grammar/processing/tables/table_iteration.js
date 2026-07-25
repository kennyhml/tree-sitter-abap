/**
 * Variants of FOR, Table Iterations
 *
 * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENFOR_ITAB.html
 */
module.exports = {
  table_iteration: $ =>
    seq(
      gen.kw("for"),
      choice(
        $.__read_itab_lines,
        $.__group_itab_lines,
        // TODO: Read groups (3rd variant)
      ),
      optional($.let_expression),
    ),

  /**
   * ... FOR wa|<fs> IN itab [INDEX INTO idx] [cond]
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENFOR_IN_ITAB.html
   */
  __read_itab_lines: $ =>
    seq(
      field("work_area", $.named_data_object),
      gen.kw("in"),
      field("subject", $.general_expression),
      repeat(choice($.itab_lines_spec, $.index_into_spec)),
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
  __group_itab_lines: $ =>
    seq(
      choice($.group_key_binding, $.representative_binding),
      $.grouping_work_area,
      optional($.index_into_spec),
      $.grouping_subject,
      optional($.index_into_spec),
      $.group_by_spec,
    ),

  index_into_spec: $ =>
    seq(...gen.kws("index", "into"), field("enumerator", $.named_data_object)),

  /**
   * The presence of a group key decides whether the expression is a representative
   * binding or a group key binding.
   *
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPLOOP_AT_ITAB_GROUP_BY_BINDING.html
   */
  group_key_binding: $ =>
    seq(gen.kw("groups"), field("name", $.named_data_object)),

  representative_binding: _ => seq(gen.kw("groups")),

  grouping_work_area: $ =>
    seq(gen.kw("of"), field("work_area", $.named_data_object)),

  grouping_subject: $ =>
    seq(
      gen.kw("in"),
      field("subject", $.general_expression),
      optional($.itab_lines_spec),
    ),
};
