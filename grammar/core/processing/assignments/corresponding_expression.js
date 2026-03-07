module.exports = {

    /**
     * Branches into multiple "forms".
     *
     * 1. {@link _corresponding_basic_form}
     * 2. {@link _corresponding_lookup_table_form}
     * 3. TODO: RAP form
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONSTRUCTOR_EXPR_CORRESPONDING.html
     */
    corresponding_expression: $ => seq(
        gen.kw("corresponding"),
        field("type", $._constructor_result),
        "(",
        choice(
            $._corresponding_basic_form,
            $._corresponding_lookup_table_form,
        ),
        ")"
    ),

    /**
     * Basic form as mapping between two structs / tables
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCORRESPONDING_CONSTR_ARG_TYPE.html
     */
    _corresponding_basic_form: $ => seq(
        optional($.exact),
        // only one of these can occur 
        optional(
            choice(
                alias($.__corresponding_base_table, $.base_table),
                $.deep
            )
        ),
        field("subject", $.general_expression),
        optional($.discarding_duplicates),
        optional($.mapping_list),
    ),

    /**
     * Lookup table form of {@link corresponding_expression} as a way to 
     * attach data from a lookup table
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCORRESPONDING_CONSTR_USING.html
     */
    _corresponding_lookup_table_form: $ => seq(
        field("subject", $.general_expression),
        gen.kw("from"),
        field("lookup_table", $.general_expression),
        choice(
            $.using_key,
            gen.kw("using"), // primary key
        ),
        $.lookup_mapping_list,
        optional($.mapping_list),
    ),

    /**
     * A list of either a single mapping ( comp1 = comp2 ... ) or
     * submappings ( struct1 = struct2 ( comp1 = comp2 ... ) ... ))
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCORRESPONDING_CONSTR_MAPPING.html
     */
    mapping_list: $ => choice(
        seq(
            gen.kw("mapping"),
            repeat1(
                choice(
                    $.submapping,
                    $.mapping
                )
            ),
            optional($.except_list),
        ),
        $.except_list
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
    submapping: $ => gen.parenthesized(seq(
        field("level", $.mapping),
        $.mapping_list,
    )),

    mapping: $ => prec.right(seq(
        field("left", $.identifier),
        "=",
        choice(
            seq(
                field("right", $.identifier),
                optional($.mapping_default)
            ),
            $.mapping_default

        ),
        optional($.discarding_duplicates),
    )
    ),

    /**
     * Specification of the component mapping for the lookup table.
     * 
     * ... s1 = t1 s2 = t2 ...
     */
    lookup_mapping_list: $ => repeat1($.lookup_mapping),

    lookup_mapping: $ => seq(
        field("left", $.identifier),
        "=",
        field("right", $.identifier),
    ),

    except_list: $ => seq(
        gen.kw("except"),
        choice(
            "*", // all
            repeat1($.identifier)
        )
    ),

    mapping_default: $ => seq(
        gen.kw("default"),
        $.general_expression
    ),

    exact: _ => prec.left(gen.kw("exact")),

    deep: _ => gen.kw("deep"),

    appending: _ => gen.kw("appending"),

    deep_appending: _ => seq(...gen.kws("deep", "appending")),

    discarding_duplicates: _ => seq(...gen.kws("discarding", "duplicates")),

    __corresponding_base_table: $ => seq(
        choice(
            // just the addition base, default..
            gen.kw("base"),
            // if appending is specified, base has the same effect and is optional
            seq($.appending, optional(gen.kw("base"))),
            // the most specific form
            seq($.deep_appending, optional(gen.kw("base")))
        ),
        "(",
        field("base", $.data_object),
        ")"
    ),
}