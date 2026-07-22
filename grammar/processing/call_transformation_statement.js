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
        $.transformation_source_xml_spec,
        $.transformation_source_bindings_spec,
      ),
      choice(
        $.transformation_result_xml_spec,
        $.transformation_result_bindings_spec,
      ),
    ),

  transformation_name_spec: $ =>
    field("name", choice($.id, $.identifier, $.dynamic_spec)),

  transformation_parameters_spec: $ =>
    seq(
      gen.kw("parameters"),
      choice(
        repeat1($.transformation_parameter_binding_spec),
        field("binding_table", $.dynamic_spec),
      ),
    ),

  transformation_parameter_binding_spec: $ =>
    seq(field("name", $.identifier), "=", field("value", $.data_object)),

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
      field("value", $.data_object),
    ),

  transformation_source_xml_spec: $ =>
    seq(...gen.kws("source", "xml"), field("xml", $.data_object)),

  transformation_source_bindings_spec: $ =>
    seq(
      gen.kw("source"),
      choice(
        repeat1($.transformation_source_binding_spec),
        field("binding_table", $.dynamic_spec),
      ),
    ),

  transformation_source_binding_spec: $ =>
    seq(field("name", $.identifier), "=", field("value", $.general_expression)),

  transformation_result_xml_spec: $ =>
    seq(...gen.kws("result", "xml"), field("xml", $.writable_expression)),

  transformation_result_bindings_spec: $ =>
    seq(
      gen.kw("result"),
      choice(
        repeat1($.transformation_result_binding_spec),
        field("binding_table", $.dynamic_spec),
      ),
    ),

  transformation_result_binding_spec: $ =>
    seq(
      field("name", $.identifier),
      "=",
      field("value", $.writable_expression),
    ),

  id: _ => gen.kw("id"),
};
