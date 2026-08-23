module.exports = {
  /*
   * ... [(] { data_source [AS tabalias] } | join
   *         { [INNER [cardinality]] JOIN }
   *       | { LEFT|RIGHT [OUTER [cardinality]] JOIN }
   *       | { CROSS JOIN }
   *         { data_source [AS tabalias] } | join [ON sql_cond] [)] ...
   *
   * @see https://help.sap.com/doc/abapdocu_758_index_htm/7.58/en-US/ABAPSELECT_JOIN.html
   */
  sql_join_expression: $ =>
    choice(
      $.__sql_join_expression,
      gen.parenthesized($.__sql_join_expression),
    ),

  __sql_join_expression: $ =>
    prec.left(
      seq(
        field("left", $._sql_join_operand),
        field("kind", alias($.__sql_join_kind, $.join_kind)),
        field("right", $._sql_join_operand),
        optional($.sql_join_condition_spec),
      ),
    ),

  _sql_join_operand: $ => choice($.sql_data_source, $.sql_join_expression),

  sql_join_condition_spec: $ =>
    seq(gen.kw("on"), field("condition", $._sql_logical_expression)),

  __sql_join_kind: $ =>
    choice(
      // [INNER [cardinality]] JOIN
      seq(
        optional(
          seq(
            gen.kw("inner"),
            optional(field("cardinality", $.join_cardinality)),
          ),
        ),
        gen.kw("join"),
      ),
      // LEFT|RIGHT [OUTER [cardinality]] JOIN (outer join)
      seq(
        choice(...gen.kws("left", "right")),
        optional(
          seq(
            gen.kw("outer"),
            optional(field("cardinality", $.join_cardinality)),
          ),
        ),
        gen.kw("join"),
      ),
      // CROSS JOIN
      seq(...gen.kws("cross", "join")),
    ),

  join_cardinality: $ =>
    seq(
      field("left", $.cardinality),
      gen.kw("to"),
      field("right", $.cardinality),
    ),
};
