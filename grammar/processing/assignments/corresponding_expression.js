module.exports = {
  /**
   * Branches into multiple "forms".
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONSTRUCTOR_EXPR_CORRESPONDING.html
   */
  corresponding_expression: $ =>
    seq(
      gen.kw("corresponding"),
      field("result_type", $._constructor_result),
      "(",
      choice(
        $.__corresponding_basic_form,
        $.__corresponding_lookup_table_form,
        $.__corresponding_type_mapping_form,
      ),
      ")",
    ),

  /**
   * Basic form as mapping between two structs / tables
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCORRESPONDING_CONSTR_ARG_TYPE.html
   */
  __corresponding_basic_form: $ =>
    seq(
      optional($.exact),
      // only one of these can occur
      optional(choice(alias($.__corresponding_base_spec, $.base_spec), $.deep)),
      field("subject", $.expression),
      optional($.discarding_duplicates),
      optional($.mapping_list_spec),
    ),

  /**
   * Lookup table form of {@link corresponding_expression} as a way to
   * attach data from a lookup table
   *
   * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCORRESPONDING_CONSTR_USING.html
   */
  __corresponding_lookup_table_form: $ =>
    seq(
      field("subject", $.expression),
      gen.kw("from"),
      field("lookup_table", $.expression),
      choice(
        $.using_key_spec,
        gen.kw("using"), // primary key
      ),
      $.lookup_mapping_list,
      optional($.mapping_list_spec),
    ),

  /**
   * RAP form
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPEML_CORRESPONDING.html
   */
  __corresponding_type_mapping_form: $ =>
    seq(
      optional(alias($.__corresponding_base_spec, $.base_spec)),
      field("subject", $.expression),
      repeat1(
        choice(
          $.mapping_from_entity,
          $.mapping_to_entity,
          $.using_control,
          $.changing_control,
        ),
      ),
    ),

  /**
   * A list of either a single mapping ( comp1 = comp2 ... ) or
   * submappings ( struct1 = struct2 ( comp1 = comp2 ... ) ... ))
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCORRESPONDING_CONSTR_MAPPING.html
   */
  mapping_list_spec: $ =>
    choice(
      seq(
        gen.kw("mapping"),
        repeat1(choice($.submapping, $.mapping)),
        optional($.except_list_spec),
      ),
      $.except_list_spec,
    ),

  /**
   * A submapping means a sub-component is being mapped to an equally
   * nested component and its components are itself mapped.
   *
   * Example:
   * ( substruc = substruc MAPPING comp1 = subcomp1
   *                               comp2 = subcomp2
   *                               comp3 = subcomp3 )
   *
   * In this case, the substructure substruc is being mapped and its components
   * are mapped individually as well.
   *
   * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCORRESPONDING_CONSTR_MAPPING.html
   */
  submapping: $ =>
    gen.parenthesized(seq(field("level", $.mapping), $.mapping_list_spec)),

  mapping: $ =>
    prec.right(
      seq(
        field("left", $.itab_comp),
        "=",
        choice(
          seq(field("right", $.itab_comp), optional($.mapping_default_spec)),
          $.mapping_default_spec,
        ),
        optional($.discarding_duplicates),
      ),
    ),

  /**
   * Specification of the component mapping for the lookup table.
   *
   * ... s1 = t1 s2 = t2 ...
   */
  lookup_mapping_list: $ => repeat1($.lookup_mapping),

  lookup_mapping: $ =>
    seq(field("left", $.itab_comp), "=", field("right", $.itab_comp)),

  except_list_spec: $ =>
    seq(
      gen.kw("except"),
      choice(
        "*", // all
        repeat1($.itab_comp),
      ),
    ),

  mapping_default_spec: $ => seq(gen.kw("default"), $.expression),

  deep: _ => gen.kw("deep"),

  appending: _ => gen.kw("appending"),

  deep_appending: _ => seq(...gen.kws("deep", "appending")),

  discarding_duplicates: _ => seq(...gen.kws("discarding", "duplicates")),

  mapping_from_entity: _ => seq(...gen.kws("mapping", "from", "entity")),

  mapping_to_entity: _ => seq(...gen.kws("mapping", "to", "entity")),

  using_control: _ => seq(...gen.kws("using", "control")),

  changing_control: _ => seq(...gen.kws("changing", "control")),

  __corresponding_base_spec: $ =>
    seq(
      choice(
        // just the addition base, default..
        gen.kw("base"),
        // if appending is specified, base has the same effect and is optional
        seq($.appending, optional(gen.kw("base"))),
        // the most specific form
        seq($.deep_appending, optional(gen.kw("base"))),
      ),
      "(",
      field("base", $._simple_operand),
      ")",
    ),
};
