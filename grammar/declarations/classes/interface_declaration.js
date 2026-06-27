module.exports = {

  interfaces_declaration: $ => gen.chainable("interfaces", $.interfaces_spec),

  /**
   * INTERFACES intf 
   *    [PARTIALLY IMPLEMENTED] 
   *    { {[ABSTRACT METHODS meth1 meth2 ... ] 
   *       [FINAL METHODS meth1 meth2 ... ]}
   *    | [ALL METHODS {ABSTRACT|FINAL}] } 
   *    [DATA VALUES attr1 = val1 attr2 = val2 ...].
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPINTERFACES_CLASS.html
   */
  interfaces_spec: $ => seq(
    field("name", $.identifier),
    repeat($.__interfaces_addition)
  ),

  __interfaces_addition: $ => choice(
    $.partially_implemented,
    $.abstract_methods,
    $.final_methods,
    $.all_methods,
    $.data_values
  ),

  partially_implemented: _ => seq(...gen.kws("partially", "implemented")),

  abstract_methods: $ => prec.right(seq(
    ...gen.kws("abstract", "methods"),
    repeat1(
      choice(
        $.identifier,
        $.component_selection // for intf~meth
      )
    )
  )),

  final_methods: $ => prec.right(seq(
    ...gen.kws("final", "methods"),
    repeat1(
      choice(
        $.identifier,
        $.component_selection // for intf~meth
      )
    )
  )),

  all_methods: $ => seq(
    ...gen.kws("all", "methods"),
    choice(
      $.final,
      $.abstract
    )
  ),

  data_values: $ => prec.right(seq(
    ...gen.kws("data", "values"),
    repeat1($.data_value_assignment)
  )),

  data_value_assignment: $ => seq(
    field("member", choice(
      $.identifier,
      $.component_selection // for intf~meth
    )),
    "=",
    field("value", $.general_expression)
  ),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPINTERFACE.html
  interface_declaration: $ => seq(
    gen.kw("interface"),
    field("name", $.identifier),
    optional($.public),
    ".",
    optional($.interface_body),
    gen.kw("endinterface"), "."
  ),

  // no public / protected / private sections in interfaces, all public.
  interface_body: $ => repeat1(
    $._class_component
  ),

  // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS_DEFERRED.html
  deferred_interface_declaration: $ => seq(
    gen.kw("interface"),
    field("name", $.identifier),
    gen.kw("deferred"),
    optional($.public),
    "."
  ),
}
