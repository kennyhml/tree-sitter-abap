module.exports = {
  /**
   * Technically obsolete but still used excessively.
   *
   * FORM subr [TABLES table_parameters]
   *           [USING parameters]
   *           [CHANGING parameters]
   *           [RAISING exc1|RESUMABLE(exc1) exc2|RESUMABLE(exc2) ...].
   *  ...
   * ENDFORM.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPFORM.html
   */
  ...gen.periodTerminated("form_definition", $ =>
    seq(
      gen.kw("form"),
      field("name", $.identifier),
      repeat(
        choice(
          gen.kw_tagged("tables", $._form_parameter_list),
          gen.kw_tagged("using", $._form_parameter_list),
          gen.kw_tagged("changing", $._form_parameter_list),
          gen.kw_tagged("raising", $.raising_list),
        ),
      ),
      ".",
      optional(field("body", alias($.statement_block, $.form_body))),
      gen.kw("endform"),
    ),
  ),

  _form_parameter_list: $ => alias($.__form_parameter_list, $.parameter_list),

  __form_parameter_list: $ =>
    prec.right(seq(repeat1(alias($.__form_parameter, $.parameter)))),

  /**
   *... { VALUE(p1) | p1 } [typing|structure]
   *    { VALUE(p2) | p2 } [typing|structure]
   *    ...
   *
   */
  __form_parameter: $ =>
    prec.right(
      seq(
        choice($.implicit_reference, $.explicit_value),
        optional(choice(field("typing", $.typing), $.structure_parameter)),
      ),
    ),

  structure_parameter: $ =>
    seq(gen.kw("structure"), field("name", $.named_data_object)),
};
