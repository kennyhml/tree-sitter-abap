module.exports = {
  _rap_method_signature: $ =>
    prec(
      1,
      seq(
        optional($.final),
        $.rap_handler_for_spec,
        $.rap_handler_parameter,
        optional(gen.kw_tagged("changing", $.parameters)),
      ),
    ),

  /*
   * Covers all RAP handler purpose specifications.
   *
   * FOR { DETERMINE ON { SAVE | MODIFY } ... [IMPORTING] ... FOR ... }
   *   | { GLOBAL AUTHORIZATION ... [IMPORTING] ... FOR ... }
   *   | { GLOBAL FEATURES ... [IMPORTING] ... FOR ... }
   *   | { [INSTANCE] AUTHORIZATION ... [IMPORTING] ... FOR ... }
   *   | { [INSTANCE] FEATURES ... [IMPORTING] ... FOR ... }
   *   | { LOCK ... [IMPORTING] ... FOR ... }
   *   | { MODIFY ... [IMPORTING] ... FOR ... }
   *   | { NUMBERING ... [IMPORTING] ... FOR ... }
   *   | { PRECHECK ... [IMPORTING] ... FOR ... }
   *   | { READ ... [IMPORTING] ... FOR ... }
   *   | { VALIDATE ON SAVE ... [IMPORTING] ... FOR ... }
   *
   * @see https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABAPHANDLER_METH_DET.html
   */
  rap_handler_for_spec: $ => seq(gen.kw("for"), choice($.determine_on_spec)),

  /*
   * [IMPORTING] { REFERENCE(param) | param } [ FOR <purpose> ]
   *
   * A large number of purposes can be named, ranging from something simple like
   * `FOR bdef~determination` for a determination handler, to more complex purposes:
   * `FOR READ bdef\_assoc FULL {param} RESULT {param} LINK {param}`
   */
  rap_handler_parameter: $ =>
    prec.dynamic(
      1,
      seq(
        optional(gen.kw("importing")),
        choice($.implicit_reference, $.explicit_reference),
        optional($.parameter_for_spec),
      ),
    ),

  determine_on_spec: $ =>
    seq(...gen.kws("determine", "on"), field("kind", choice($.save, $.modify))),

  parameter_for_spec: $ => seq(gen.kw("for"), $.bo_determination),

  save: _ => gen.kw("save"),

  modify: _ => gen.kw("modify"),
};
