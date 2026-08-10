module.exports = {
  /**
   * CALL TRANSFORMATION {ID|trans|(name)}
   *   [PARAMETERS {p1 = e1 p2 = e2 ...|(ptab)}]
   *   [OPTIONS options]
   *   SOURCE {XML src_xml|{bn1 = e1 bn2 = e2 ...|(stab)}}
   *   RESULT {XML rslt_xml|{bn1 = f1 bn2 = f2 ...|(rtab)}}.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCALL_TRANSFORMATION.html
   */
  call_transformation_statement: $ =>
    seq($.__call_transformation_statement_prefix, "."),

  __call_transformation_statement_prefix: $ =>
    seq(
      ...gen.kws("call", "transformation"),
      $.transformation_name_spec,
      optional($.transformation_parameters_spec),
      optional($.transformation_options_spec),
      choice(
        $.source_xml_spec,
        $.source_bindings_spec,
      ),
      choice(
        $.result_xml_spec,
        $.result_bindings_spec,
      ),
    ),

  transformation_name_spec: $ =>
    field("name", choice($.id, $.identifier, $.dynamic_spec)),

  transformation_parameters_spec: $ =>
    seq(
      gen.kw("parameters"),
      choice(
        repeat1(
          alias(
            $._operand_binding,
            $.transformation_parameter_binding_spec,
          ),
        ),
        field("binding_table", $.dynamic_spec),
      ),
    ),

  transformation_options_spec: $ =>
    seq(gen.kw("options"), repeat1($.transformation_option_spec)),

  transformation_option_spec: $ =>
    seq(
      field(
        "name",
        choice(
          gen.kw("clear"),
          gen.kw("data_refs"),
          gen.kw("initial_components"),
          gen.kw("technical_types"),
          gen.kw("value_handling"),
          gen.kw("exceptions"),
          gen.kw("xml_header"),
        ),
      ),
      "=",
      field("value", $._simple_operand),
    ),

  source_xml_spec: $ =>
    seq(...gen.kws("source", "xml"), field("xml", $._simple_operand)),

  source_bindings_spec: $ =>
    seq(
      gen.kw("source"),
      choice(
        repeat1($.source_binding_spec),
        field("binding_table", $.dynamic_spec),
      ),
    ),

  source_binding_spec: $ =>
    seq(field("name", $.identifier), "=", field("value", $.expression)),

  result_xml_spec: $ =>
    seq(...gen.kws("result", "xml"), field("xml", $._write_target)),

  result_bindings_spec: $ =>
    seq(
      gen.kw("result"),
      choice(
        repeat1($.result_binding_spec),
        field("binding_table", $.dynamic_spec),
      ),
    ),

  result_binding_spec: $ =>
    seq(
      field("name", $.identifier),
      "=",
      field("value", $._write_target),
    ),

  id: _ => gen.kw("id"),
};
