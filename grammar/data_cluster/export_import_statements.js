module.exports = {
  /**
   * EXPORT parameter_list TO medium [COMPRESSION {ON|OFF}].
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPEXPORT_DATA_CLUSTER.html
   */
  export_statement: $ => seq($.__export_statement_prefix, "."),

  __export_statement_prefix: $ =>
    seq(
      gen.kw("export"),
      $.__export_data_cluster_parameters,
      gen.kw("to"),
      field("medium", $.__export_data_cluster_medium),
      optional($.compression_spec),
    ),

  /**
   * ... {p1 = dobj1 p2 = dobj2 ...}
   *   | {p1 FROM dobj1 p2 FROM dobj2 ...}
   *   | (ptab) ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPEXPORT_DATA_CLUSTER_PARAM.html
   */
  __export_data_cluster_parameters: $ =>
    choice(
      repeat1($.export_data_cluster_parameter),
      $.data_cluster_parameter_table,
    ),

  export_data_cluster_parameter: $ =>
    seq(
      field("name", $.identifier),
      choice("=", gen.kw("from")),
      field(
        "source",
        choice($._data_cluster_buffer_identifier, $._contextual_simple_operand),
      ),
    ),

  /**
   * IMPORT parameter_list FROM medium [conversion_options].
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPIMPORT_DATA_CLUSTER.html
   */
  import_statement: $ => seq($.__import_statement_prefix, "."),

  __import_statement_prefix: $ =>
    seq(
      gen.kw("import"),
      $.__import_data_cluster_parameters,
      gen.kw("from"),
      field("medium", $.__import_data_cluster_medium),
      repeat($.__import_conversion_option),
    ),

  /**
   * ... {p1 = dobj1 p2 = dobj2 ...}
   *   | {p1 TO dobj1 p2 TO dobj2 ...}
   *   | (ptab) ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPIMPORT_PARAMETERLIST.html
   */
  __import_data_cluster_parameters: $ =>
    choice(
      repeat1($.import_data_cluster_parameter),
      $.data_cluster_parameter_table,
    ),

  import_data_cluster_parameter: $ =>
    seq(
      field("name", $.identifier),
      choice("=", gen.kw("to")),
      field(
        "destination",
        choice(
          $._data_cluster_buffer_identifier,
          $._contextual_identifier,
          $._write_target,
        ),
      ),
    ),

  data_cluster_parameter_table: $ =>
    gen.tightParens(
      field(
        "table",
        choice(
          $._data_cluster_buffer_identifier,
          $._contextual_identifier,
          $._reference_operand,
        ),
      ),
    ),

  _data_cluster_buffer_identifier: $ =>
    alias(prec(-1, gen.caseInsensitive("buffer")), $.identifier),

  /**
   * ... {DATA BUFFER xstr}
   *   | {INTERNAL TABLE itab}
   *   | {MEMORY ID id}
   *   | {DATABASE dbtab(ar) [FROM wa] [CLIENT cl] ID id}
   *   | {SHARED MEMORY dbtab(ar) [FROM wa] [CLIENT cl] ID id}
   *   | {SHARED BUFFER dbtab(ar) [FROM wa] [CLIENT cl] ID id} ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPEXPORT_DATA_CLUSTER_MEDIUM.html
   */
  __export_data_cluster_medium: $ =>
    choice(
      $.export_data_buffer_spec,
      $.export_internal_table_spec,
      $.export_memory_spec,
      $.export_database_spec,
      $.export_shared_memory_spec,
      $.export_shared_buffer_spec,
    ),

  export_data_buffer_spec: $ =>
    seq(
      ...gen.kws("data", "buffer"),
      field(
        "destination",
        choice($._data_cluster_buffer_identifier, $._write_target),
      ),
    ),

  export_internal_table_spec: $ =>
    seq(
      ...gen.kws("internal", "table"),
      field(
        "destination",
        choice($._data_cluster_buffer_identifier, $._write_target),
      ),
    ),

  export_memory_spec: $ => seq(gen.kw("memory"), $.data_cluster_id_spec),

  export_database_spec: $ =>
    seq(gen.kw("database"), $.__export_cluster_table_medium),

  export_shared_memory_spec: $ =>
    seq(...gen.kws("shared", "memory"), $.__export_cluster_table_medium),

  export_shared_buffer_spec: $ =>
    seq(...gen.kws("shared", "buffer"), $.__export_cluster_table_medium),

  __export_cluster_table_medium: $ =>
    seq(
      $._data_cluster_table_area,
      optional($.data_cluster_from_spec),
      optional($.data_cluster_client_spec),
      $.data_cluster_id_spec,
    ),

  /** COMPRESSION {ON|OFF} */
  compression_spec: $ =>
    seq(
      gen.kw("compression"),
      field("mode", choice(...gen.kws("on", "off"))),
    ),

  /**
   * ... {DATA BUFFER xstr}
   *   | {INTERNAL TABLE itab}
   *   | {MEMORY ID id}
   *   | {DATABASE dbtab(ar) [TO wa] [CLIENT cl] ID id}
   *   | {SHARED MEMORY dbtab(ar) [TO wa] [CLIENT cl] ID id}
   *   | {SHARED BUFFER dbtab(ar) [TO wa] [CLIENT cl] ID id} ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPIMPORT_MEDIUM.html
   */
  __import_data_cluster_medium: $ =>
    choice(
      $.import_data_buffer_spec,
      $.import_internal_table_spec,
      $.import_memory_spec,
      $.import_database_spec,
      $.import_shared_memory_spec,
      $.import_shared_buffer_spec,
    ),

  import_data_buffer_spec: $ =>
    seq(
      ...gen.kws("data", "buffer"),
      field(
        "source",
        choice($._data_cluster_buffer_identifier, $._reference_operand),
      ),
    ),

  import_internal_table_spec: $ =>
    seq(
      ...gen.kws("internal", "table"),
      field(
        "source",
        choice($._data_cluster_buffer_identifier, $._reference_operand),
      ),
    ),

  import_memory_spec: $ => seq(gen.kw("memory"), $.data_cluster_id_spec),

  import_database_spec: $ =>
    seq(gen.kw("database"), $.__import_cluster_table_medium),

  import_shared_memory_spec: $ =>
    seq(...gen.kws("shared", "memory"), $.__import_cluster_table_medium),

  import_shared_buffer_spec: $ =>
    seq(...gen.kws("shared", "buffer"), $.__import_cluster_table_medium),

  __import_cluster_table_medium: $ =>
    seq(
      $._data_cluster_table_area,
      choice(
        seq(
          optional($.data_cluster_to_spec),
          optional($.data_cluster_client_spec),
          $.data_cluster_id_spec,
        ),
        seq(
          optional($.data_cluster_client_spec),
          $.data_cluster_id_spec,
          $.data_cluster_to_spec,
        ),
      ),
    ),

  /**
   * ... [ACCEPTING PADDING] [ACCEPTING TRUNCATION]
   *     [IGNORING STRUCTURE BOUNDARIES]
   *     [IGNORING CONVERSION ERRORS [REPLACEMENT CHARACTER rc]]
   *     [IN CHAR-TO-HEX MODE]
   *     [CODE PAGE INTO cp] [ENDIAN INTO endian] ...
   *
   * @see https://help.sap.com/doc/abapdocu_816_index_htm/8.16/en-US/ABAPIMPORT_CONVERSION.html
   */
  __import_conversion_option: $ =>
    choice(
      $.accepting_padding,
      $.accepting_truncation,
      $.ignoring_structure_boundaries,
      $.__import_conversion_errors_spec,
      $.char_to_hex_mode,
      $.code_page_into_spec,
      $.endian_into_spec,
    ),

  accepting_padding: _ => seq(...gen.kws("accepting", "padding")),

  accepting_truncation: _ => seq(...gen.kws("accepting", "truncation")),

  ignoring_structure_boundaries: _ =>
    seq(...gen.kws("ignoring", "structure", "boundaries")),

  __import_conversion_errors_spec: $ =>
    seq($.ignoring_conversion_errors, optional($.replacement_character_spec)),

  char_to_hex_mode: _ => seq(...gen.kws("in", "char-to-hex", "mode")),

  code_page_into_spec: $ =>
    seq(
      ...gen.kws("code", "page", "into"),
      field("destination", $._write_target),
    ),

  endian_into_spec: $ =>
    seq(
      ...gen.kws("endian", "into"),
      field("destination", $._write_target),
    ),
};
