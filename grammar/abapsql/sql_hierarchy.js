module.exports = {
  /**
   * ... HIERARCHY( SOURCE hierarchy_source [WITH PRIVILEGED ACCESS]
   *                  CHILD TO PARENT ASSOCIATION association
   *                 [PERIOD ...]
   *                  START WHERE sql_cond
   *                 [SIBLINGS ORDER BY ...]
   *                 [DEPTH ...]
   *                 [MULTIPLE PARENTS ...]
   *                 [ORPHANS ...]
   *                 [CYCLES ...]
   *                 [GENERATE SPANTREE] ) ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABENSELECT_HIERARCHY_GENERATOR.html
   */
  sql_hierarchy_generator: $ =>
    seq(
      gen.kw("hierarchy"),
      token.immediate("("),
      $.sql_hierarchy_source_spec,
      $.sql_hierarchy_association_spec,
      optional($.sql_hierarchy_period_spec),
      $.sql_hierarchy_start_spec,
      optional($.sql_hierarchy_siblings_order_spec),
      optional($.sql_hierarchy_depth_spec),
      optional($.sql_hierarchy_multiple_parents_spec),
      optional($.sql_hierarchy_orphans_spec),
      optional($.sql_hierarchy_cycles_spec),
      optional($.sql_hierarchy_spantree_spec),
      ")",
    ),

  sql_hierarchy_source_spec: $ =>
    seq(
      gen.kw("source"),
      choice(
        seq(
          field(
            "source",
            choice($.identifier, $.sql_parameterized_data_source),
          ),
          optional($.with_privileged_access),
        ),
        field("source", $.cte_name),
        field("source", $.sql_hierarchy_generator),
      ),
    ),

  /**
   * ... HIERARCHY_DESCENDANTS|HIERARCHY_ANCESTORS(
   *       SOURCE hierarchy START WHERE sql_cond [DISTANCE ...] )
   *   | HIERARCHY_SIBLINGS(
   *       SOURCE hierarchy START WHERE sql_cond ) ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABENSELECT_HIERARCHY_NODE_NAVIS.html
   */
  sql_hierarchy_node_navigator: $ =>
    choice(
      seq(
        field(
          "kind",
          alias(
            choice(
              gen.kw("hierarchy_descendants"),
              gen.kw("hierarchy_ancestors"),
            ),
            $.sql_hierarchy_node_navigator_kind,
          ),
        ),
        token.immediate("("),
        $.sql_hierarchy_navigator_source_spec,
        $.sql_hierarchy_start_spec,
        optional($.sql_hierarchy_distance_spec),
        ")",
      ),
      seq(
        field(
          "kind",
          alias(
            gen.kw("hierarchy_siblings"),
            $.sql_hierarchy_node_navigator_kind,
          ),
        ),
        token.immediate("("),
        $.sql_hierarchy_navigator_source_spec,
        $.sql_hierarchy_start_spec,
        ")",
      ),
    ),

  sql_hierarchy_navigator_source_spec: $ =>
    seq(gen.kw("source"), field("source", $._sql_hierarchy)),

  sql_hierarchy_distance_spec: $ =>
    seq(
      gen.kw("distance"),
      choice(
        seq(
          gen.kw("from"),
          field("from", $._sql_hierarchy_operand),
          optional(
            seq(gen.kw("to"), field("to", $._sql_hierarchy_operand)),
          ),
        ),
        seq(gen.kw("to"), field("to", $._sql_hierarchy_operand)),
      ),
    ),

  /**
   * ... HIERARCHY_DESCENDANTS_AGGREGATE( ... )
   *   | HIERARCHY_ANCESTORS_AGGREGATE( ... ) ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABENSELECT_HIERARCHY_AGG_NAVIS.html
   */
  sql_hierarchy_aggregate_navigator: $ =>
    choice(
      seq(
        field(
          "kind",
          alias(
            gen.kw("hierarchy_descendants_aggregate"),
            $.sql_hierarchy_aggregate_navigator_kind,
          ),
        ),
        token.immediate("("),
        $.sql_hierarchy_aggregate_source_spec,
        optional($.sql_hierarchy_aggregate_join_spec),
        $.sql_hierarchy_measures_spec,
        optional($._sql_where_condition_spec),
        repeat($.sql_hierarchy_aggregate_with_spec),
        ")",
      ),
      seq(
        field(
          "kind",
          alias(
            gen.kw("hierarchy_ancestors_aggregate"),
            $.sql_hierarchy_aggregate_navigator_kind,
          ),
        ),
        token.immediate("("),
        $.sql_hierarchy_aggregate_source_spec,
        optional($.sql_hierarchy_start_spec),
        $.sql_hierarchy_measures_spec,
        optional($._sql_where_condition_spec),
        ")",
      ),
    ),

  sql_hierarchy_aggregate_source_spec: $ =>
    seq(
      gen.kw("source"),
      field("source", $._sql_hierarchy),
      optional($.sql_source_alias_spec),
    ),

  sql_hierarchy_aggregate_join_spec: $ =>
    seq(
      gen.kw("join"),
      choice(
        field("source", $.sql_data_source),
        seq(
          field("source", $.dynamic_spec),
          optional(field("alias", $.sql_source_alias_spec)),
        ),
      ),
      $.sql_join_condition_spec,
    ),

  sql_hierarchy_measures_spec: $ =>
    seq(gen.kw("measures"), gen.commaSep1($.sql_hierarchy_measure)),

  sql_hierarchy_measure: $ =>
    seq(
      field("function", $.sql_function_call),
      field("alias", $.sql_field_alias_spec),
    ),

  sql_hierarchy_aggregate_with_spec: _ =>
    seq(
      gen.kw("with"),
      choice(
        ...gen.kws("subtotal", "balance", "total"),
        seq(...gen.kws("not", "matched")),
      ),
    ),

  sql_hierarchy_association_spec: $ =>
    seq(
      ...gen.kws("child", "to", "parent", "association"),
      field("association", $.identifier),
    ),

  sql_hierarchy_period_spec: $ =>
    seq(
      ...gen.kws("period", "from"),
      field("period_from", $.identifier),
      gen.kw("to"),
      field("period_to", $.identifier),
      ...gen.kws("valid", "from"),
      field("valid_from", $._sql_hierarchy_operand),
      gen.kw("to"),
      field("valid_to", $._sql_hierarchy_operand),
    ),

  sql_hierarchy_start_spec: $ =>
    seq(
      ...gen.kws("start", "where"),
      field("condition", $._sql_logical_expression),
    ),

  sql_hierarchy_siblings_order_spec: $ =>
    seq(
      ...gen.kws("siblings", "order", "by"),
      $.sql_hierarchy_order_by_list,
    ),

  sql_hierarchy_order_by_list: $ =>
    gen.commaSep1($.sql_hierarchy_order_by_field),

  sql_hierarchy_order_by_field: $ =>
    seq(
      field("column", $.identifier),
      optional(field("direction", choice($.ascending, $.descending))),
    ),

  sql_hierarchy_depth_spec: $ =>
    seq(gen.kw("depth"), field("depth", $._sql_hierarchy_operand)),

  sql_hierarchy_multiple_parents_spec: _ =>
    seq(
      ...gen.kws("multiple", "parents"),
      choice(
        seq(...gen.kws("not", "allowed")),
        seq(...gen.kws("leaves", "only")),
        gen.kw("allowed"),
      ),
    ),

  sql_hierarchy_orphans_spec: _ =>
    seq(
      gen.kw("orphans"),
      choice(...gen.kws("ignore", "error", "root")),
    ),

  sql_hierarchy_cycles_spec: _ =>
    seq(gen.kw("cycles"), choice(...gen.kws("error", "breakup"))),

  sql_hierarchy_spantree_spec: _ =>
    seq(...gen.kws("generate", "spantree")),

  _sql_hierarchy_operand: $ =>
    choice($.sql_host_expression, $.sql_host_variable, $.literal),

  _sql_hierarchy: $ =>
    choice(
      $.identifier,
      $.sql_parameterized_data_source,
      $.cte_name,
      $.sql_hierarchy_generator,
    ),
};
