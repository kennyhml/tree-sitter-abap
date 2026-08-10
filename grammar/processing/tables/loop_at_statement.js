module.exports = {
  /**
   * 1. LOOP AT itab result [cond].
   * ...
   * ENDLOOP.
   *
   * 2. LOOP AT itab result [cond] GROUP BY group_key
   * [ASCENDING|DESCENDING [AS TEXT]]
   * [WITHOUT MEMBERS]
   * [group_result].
   * ...
   * ENDLOOP.
   *
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPLOOP_AT_ITAB_VARIANTS.html
   */
  loop_at_statement: $ => seq($.__loop_at_statement_prefix, "."),

  __loop_at_statement_prefix: $ =>
    seq(
      ...gen.kws("loop", "at"),
      field("subject", $._call_or_access_operand),
      repeat(choice(field("result", $.__loop_at_result), $.itab_lines_spec)),
      optional($.group_by_spec),
      ".",
      optional(field("body", $.loop_at_body)),
      gen.kw("endloop"),
    ),

  /**
   *
   * LOOP AT GROUP group result [WHERE log_exp] [GROUP BY ...].
   *   ...
   * ENDLOOP.
   *
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPLOOP_AT_GROUP.html
   */
  loop_at_group_statement: $ => seq($.__loop_at_group_statement_prefix, "."),

  __loop_at_group_statement_prefix: $ =>
    seq(
      ...gen.kws("loop", "at", "group"),
      field("subject", $.name_reference),
      repeat(choice(field("result", $.__loop_at_result), $.itab_lines_spec)),
      optional($.group_by_spec),
      ".",
      optional(field("body", alias($.statement_block, $.loop_at_body))),
      gen.kw("endloop"),
    ),

  loop_at_body: $ =>
    repeat1(
      choice(
        $.simple_statement,
        $.at_first_statement,
        $.at_new_statement,
        $.at_end_of_statement,
        $.at_last_statement,
      ),
    ),

  /**
   * Group processing statement block in a {@link loop_at_statement}.
   *
   * [AT FIRST.
   * ...
   * ENDAT.]
   *
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPAT_ITAB.html
   */
  at_first_statement: $ => seq($.__at_first_statement_prefix, "."),

  __at_first_statement_prefix: $ =>
    seq(
      ...gen.kws("at", "first"),
      ".",
      optional(field("body", alias($.statement_block, $.body))),
      gen.kw("endat"),
    ),

  /**
   * Group processing statement block in a {@link loop_at_statement}.
   *
   * [AT NEW comp1.
   * ...
   * ENDAT.]
   *
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPAT_ITAB.html
   */
  at_new_statement: $ => seq($.__at_new_statement_prefix, "."),

  __at_new_statement_prefix: $ =>
    seq(
      ...gen.kws("at", "new"),
      field("component", $.itab_comp),
      ".",
      optional(field("body", alias($.statement_block, $.body))),
      gen.kw("endat"),
    ),

  /**
   * Group processing statement block in a {@link loop_at_statement}.
   *
   * [AT END OF comp1.
   * ...
   * ENDAT.]
   *
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPAT_ITAB.html
   */
  at_end_of_statement: $ => seq($.__at_end_of_statement_prefix, "."),

  __at_end_of_statement_prefix: $ =>
    seq(
      ...gen.kws("at", "end", "of"),
      field("component", $.itab_comp),
      ".",
      optional(field("body", alias($.statement_block, $.body))),
      gen.kw("endat"),
    ),

  /**
   * Group processing statement block in a {@link loop_at_statement}.
   *
   * [AT LAST.
   * ...
   * ENDAT.]
   *
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPAT_ITAB.html
   */
  at_last_statement: $ => seq($.__at_last_statement_prefix, "."),

  __at_last_statement_prefix: $ =>
    seq(
      ...gen.kws("at", "last"),
      ".",
      optional(field("body", alias($.statement_block, $.body))),
      gen.kw("endat"),
    ),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPLOOP_AT_ITAB_RESULT.html
  __loop_at_result: $ =>
    choice(
      $.into_spec,
      $.assigning_spec,
      $.reference_into_spec,
      alias($._transporting_no_fields_spec, $.transporting_spec),
    ),

  sum_statement: _ => seq(gen.kw("sum"), "."),
};
