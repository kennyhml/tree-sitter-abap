module.exports = {
  /**
   * SET PARAMETER ID pid FIELD dobj.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSET_PARAMETER.html
   */
  set_parameter_statement: $ =>
    seq(
      ...gen.kws("set", "parameter", "id"),
      field("name", $.character_like_expression),
      gen.kw("field"),
      field("value", $.general_expression),
      ".",
    ),

  /**
   * GET PARAMETER ID pid FIELD dobj.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPGET_PARAMETER.html
   */
  get_parameter_statement: $ =>
    seq(
      ...gen.kws("get", "parameter", "id"),
      field("name", $.character_like_expression),
      gen.kw("field"),
      field("destination", $.writable_expression),
      ".",
    ),
};
