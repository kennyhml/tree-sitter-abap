module.exports = {
  /*
   * CONVERT KEY OF [bdef|(bdef)]
   *   FROM [TEMPORARY] pre_key
   *   TO final_key.
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPCONVERT_KEY.html
   */
  convert_key_statement: $ =>
    seq(
      ...gen.kws("convert", "key", "of"),
      field("business_object", choice($.business_object, $.dynamic_spec)),
      gen.kw("from"),
      optional(gen.kw("temporary")),
      field("preliminary_key", $.expression),
      gen.kw("to"),
      field("final_key", $._write_target),
      ".",
    ),
};
