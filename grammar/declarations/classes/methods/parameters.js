module.exports = {

  /**
   * VALUE(p1) | REFERENCE(p1) | p1 } 
   *   typing [OPTIONAL|{DEFAULT def1}] 
   * VALUE(p2) | REFERENCE(p2) | p2 } 
   *   typing [OPTIONAL|{DEFAULT def2}] 
   * 
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHODS_PARAMETERS.html
   */
  parameters: $ => seq(
    repeat1($.parameter),
    optional($.preferred_parameter)
  ),

  exceptions: $ => repeat1($.identifier),

  raising_list: $ => repeat1(
    choice(
      $.resumable_exception,
      $.non_resumable_exception
    )
  ),

  parameter: $ => prec.right(seq(
    choice(
      $.implicit_reference,
      $.explicit_value,
      $.explicit_reference,
    ),
    optional(field("typing", $.typing)),
    optional(choice(
      $.optional,
      $.parameter_default
    ))
  )),

  preferred_parameter: $ => seq(
    ...gen.kws("preferred", "parameter"),
    field("name", $.identifier)
  ),

  optional: _ => gen.kw("optional"),

  parameter_default: $ => seq(
    gen.kw("default"),
    field("value", choice(
      $.identifier, // constant
      $.number,
      $.string_literal
    ))
  ),

  implicit_reference: $ => seq(
    optional("!"),
    field("name", $.identifier),
  ),

  explicit_value: $ => seq(
    gen.kw("value"),
    token.immediate("("),
    field("name", $._immediate_identifier),
    token.immediate(")"),
  ),

  explicit_reference: $ => seq(
    gen.kw("reference"),
    token.immediate("("),
    field("name", $._immediate_identifier),
    token.immediate(")"),
  ),

  resumable_exception: $ => seq(
    gen.kw("resumable"),
    token.immediate("("),
    field("name", $._immediate_identifier),
    token.immediate(")"),
  ),

  non_resumable_exception: $ => field("name", $.identifier),
}
