module.exports = {
  /**
   * MODIFY { itab_line | itab_lines }.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMODIFY_ITAB.html
   */
  modify_statement: $ => seq($.__modify_statement_prefix, "."),

  __modify_statement_prefix: $ =>
    seq(
      gen.kw("modify"),
      choice(
        seq($.__modify_itab_key_spec, $.__modify_single_line_additions),
        $.__modify_itab_index_or_lines_spec,
      ),
    ),

  /**
   * ... TABLE itab [USING KEY keyname] FROM wa
   *                [TRANSPORTING comp1 comp2 ...] [result] ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMODIFY_ITAB_TABLE_KEY.html
   */
  __modify_itab_key_spec: $ =>
    seq(
      gen.kw("table"),
      field("subject", $.general_expression),
      optional($.using_key_spec),
    ),

  /**
   * ... { itab INDEX idx [USING KEY keyname]
   *     | itab [USING KEY loop_key] } FROM wa ...
   *   | itab FROM wa [INDEX idx [USING KEY keyname]] ...
   *   | itab FROM wa [USING KEY keyname]
   *          TRANSPORTING comp1 comp2 ... WHERE log_exp|(cond_syntax) ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMODIFY_ITAB_INDEX.html
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMODIFY_ITAB_MULTIPLE.html
   */
  __modify_itab_index_or_lines_spec: $ =>
    seq(
      field("subject", $.general_expression),
      choice(
        seq(
          choice($.index_spec, $.using_loop_key_spec),
          $.__modify_single_line_additions,
        ),
        seq($.from_work_area_spec, optional($.__modify_after_work_area)),
      ),
    ),

  /**
   * ... FROM wa [TRANSPORTING comp1 comp2 ...] [result] ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMODIFY_ITAB_SINGLE.html
   */
  __modify_single_line_additions: $ =>
    seq($.from_work_area_spec, optional($.__modify_single_line_tail)),

  /**
   * ... { TRANSPORTING comp1 comp2 ... [result] | result } ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMODIFY_ITAB_SINGLE.html
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMODIFY_ITAB_RESULT.html
   */
  __modify_single_line_tail: $ =>
    choice(
      seq(
        alias($._transporting_components_spec, $.transporting_spec),
        optional($.__modify_result),
      ),
      $.__modify_result,
    ),

  /**
   * ... FROM wa { INDEX idx [USING KEY keyname]
   *               [TRANSPORTING comp1 comp2 ...] [result]
   *             | TRANSPORTING comp1 comp2 ... [WHERE log_exp|(cond_syntax)]
   *             | result } ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMODIFY_ITAB_INDEX.html
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMODIFY_ITAB_MULTIPLE.html
   */
  __modify_after_work_area: $ =>
    choice(
      seq($.index_spec, optional($.__modify_single_line_tail)),
      seq(
        alias($._transporting_components_spec, $.transporting_spec),
        optional(choice($.where_condition_spec, $.__modify_result)),
      ),
      $.__modify_result,
    ),

  /**
   * ... { ASSIGNING <fs> [CASTING] [ELSE UNASSIGN] }
   *   | { REFERENCE INTO dref } ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMODIFY_ITAB_RESULT.html
   */
  __modify_result: $ => field("result", $._itab_mutation_result),
};
