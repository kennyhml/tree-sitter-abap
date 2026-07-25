module.exports = {
  /**
   * AUTHORITY-CHECK OBJECT auth_obj [FOR USER user]
   *                        ID id1 {FIELD val1}|DUMMY
   *                        ...
   *                        [ID idn {FIELD valn}|DUMMY].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPAUTHORITY-CHECK.html
   */
  authority_check_statement: $ =>
    seq(
      ...gen.kws("authority-check", "object"),
      field("auth_object", $.data_object),
      optional($.for_user_spec),
      repeat1($.id_field_spec),
    ),

  for_user_spec: $ =>
    seq(...gen.kws("for", "user"), field("user", $.data_object)),

  id_field_spec: $ =>
    seq(
      gen.kw_tagged("id", $.data_object),
      choice(gen.kw_tagged("field", $.data_object), $.dummy),
    ),

  dummy: _ => gen.kw("dummy"),
};
