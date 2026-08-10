module.exports = {
  /**
   * SET PARAMETER ID pid FIELD dobj.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSET_PARAMETER.html
   */
  set_parameter_statement: $ => seq($.__set_parameter_statement_prefix, "."),

  __set_parameter_statement_prefix: $ =>
    seq(
      ...gen.kws("set", "parameter", "id"),
      field("name", $._character_position),
      gen.kw("field"),
      field("value", $.expression),
    ),

  /**
   * GET PARAMETER ID pid FIELD dobj.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPGET_PARAMETER.html
   */
  get_parameter_statement: $ => seq($.__get_parameter_statement_prefix, "."),

  __get_parameter_statement_prefix: $ =>
    seq(
      ...gen.kws("get", "parameter", "id"),
      field("name", $._character_position),
      gen.kw("field"),
      field("destination", $._write_target),
    ),
};
