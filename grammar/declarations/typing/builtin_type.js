module.exports = {

  /**
   * Specification of a builtin type (also called abap_type)
   *
   * TYPES { {dtype[(len)] TYPE abap_type [DECIMALS dec]} 
   *     / {dtype TYPE abap_type [LENGTH len] [DECIMALS dec]}}.
   * 
   * The special part about this form is that it allows the specification
   * of metadata such as type length, decimals in different syntax forms.
   *
   * In favor of parser size, builtin types are not hardcoded here. This
   * conflicts can arise in which case this rule should take lower precedence
   * unless the typing form cannot be parsed by other rules.
   *
   * I clearly want this rule separated from the thought of simply USING
   * a builtin type vs making a specification of a NEW type based on some
   * builtin type, which is what this rule is for.
   *
   * In other words, a `...type c` is not a builtin_type_spec whereas the
   * form `... type c length 20` or similar additions would be. The fundamental
   * idea of an abap type may occur in many more positions and is bound to the
   * literal type name in queries, not the expression.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDATA_SIMPLE.html
   */
  builtin_type_spec: $ => prec.right(-1, seq(
    choice(
      seq(
        optional($.parenthesized_length),
        gen.kw("type"),
        field("name", $.identifier),
      ),
      $.parenthesized_length,
    ),
    repeat($.__abap_type_additions)
  )),

  parenthesized_length: $ => gen.immediateTightParens(
    field("length", $._immediate_number)
  ),

  type_length: $ => seq(
    gen.kw("length"),
    field("count", choice($.number, $.string_literal))
  ),

  type_decimals: $ => seq(
    gen.kw("decimals"),
    field("count", $.number)
  ),

  __abap_type_additions: $ => choice(
    $.type_length,
    $.type_decimals,
    $.initial_value,
    $.default_data_value,
    $.read_only
  ),
}
