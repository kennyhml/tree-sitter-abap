module.exports = {
  /**
   * This statement assigns the memory area specified using mem_area to the field symbol <fs>
   *
   * ASSIGN mem_area TO <fs> casting
   *                         range_spec
   *                         [ELSE UNASSIGN].
   *
   * This is still very commonly used for RTTI as it allows to loop over fields
   * of a table and assign the values to a field symbol.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPASSIGN.html
   */
  assign_statement: $ => seq($.__assign_statement_prefix, "."),

  __assign_statement_prefix: $ =>
    seq(
      gen.kw("assign"),
      field("source", choice($.__assign_source)),
      // technically only possible when using a static dobj for source
      optional($.assignment_increment_spec),
      gen.kw("to"),
      field("destination", choice($.field_symbol, $.declaration_expression)),
      optional($.assignment_casting_spec),
      optional($.assignment_range_spec),
      optional($.else_unassign),
    ),

  /**
   * ... static_dobj
   *    / dynamic_dobj
   *    / dynamic_components
   *    / dynamic_access
   *    / writable_exp ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPASSIGN_MEM_AREA.html
   */
  __assign_source: $ =>
    choice(
      $._simple_operand,
      $.dynamic_spec,
      $.component_of_structure,
      $._write_target,
    ),

  /**
   * ... dobj INCREMENT inc ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPASSIGN_MEM_AREA_DYNAMIC_DOBJ.html
   */
  assignment_increment_spec: $ =>
    seq(gen.kw("increment"), field("amount", $._simple_operand)),

  /**
   * ... {} / RANGE range ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPASSIGN_RANGE.html
   */
  assignment_range_spec: $ =>
    seq(gen.kw("range"), field("range", $._reference_operand)),

  /**
   * ... { }  
   *   / { CASTING { { }
   *               / {TYPE type|(name)}
   *               / {LIKE dobj}
   *               / {[TYPE p] DECIMALS dec}
   *               / {TYPE HANDLE handle}  } }
   *  / { obsolete_casting } ...
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPASSIGN_CASTING.html
   */
  assignment_casting_spec: $ =>
    choice(
      seq(
        gen.kw("casting"),
        optional(
          choice(
            field("typing", $.typing),
            $.type_handle_spec,
            $.type_decimals_spec,
          ),
        ),
      ),
      $.typing, // obsolete spec
    ),

  /**
   * ...  { COMPONENT comp OF STRUCTURE struc } ...
   *
   * I believe this only exists in the context of ASSIGN statements.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPASSIGN_DYNAMIC_COMPONENTS.html
   */
  component_of_structure: $ =>
    seq(
      gen.kw("component"),
      // ... comp is a character-like or numeric expression position.
      field("comp", choice($._character_position, $._numeric_position)),
      ...gen.kws("of", "structure"),
      // ... The structure can be specified as a data object or as a writable expression.
      field("struct", $._write_target),
    ),

};
