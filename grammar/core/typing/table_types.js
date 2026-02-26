const gen = require('../generators.js');

module.exports = {

    /**
     * Specification of an internal table type
     * 
     * ...   { {TYPE [STANDARD]|SORTED|HASHED TABLE OF [REF TO] type} 
     *       / {LIKE [STANDARD]|SORTED|HASHED TABLE OF dobj} } 
     *       [tabkeys] 
     *       [INITIAL SIZE n] 
     *       [VALUE IS INITIAL]
     *       [READ-ONLY].
     * 
     * Technically, the available additions depend on the context. For example,
     * the addition VALUE IS INITIAL cannot be specified in a TYPES declaration.
     * 
     * To enable permissive parsing and to keep it simple however, it is allowed here.
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDATA_ITAB.html
     */
    table_type_spec: $ => prec.right(seq(
        choice(
            $.__generic_table_type,
            $.__table_like_spec,
            $.__table_type_spec,
        ),
        repeat($.__table_type_addition),
    )),

    /**
     * Specification of a table key in the table type.
     * 
     * ... [ WITH key ] 
     *     [ WITH secondary_key1 ] [ WITH secondary_key2 ] ...
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPTYPES_PRIMARY_KEY.html
     */
    with_table_key: $ => prec.right(seq(
        gen.kw("with"),
        choice(
            $.empty_key,
            $.table_key
        )
    )),

    /**
     * Specification of a table key. Some differences between primary key
     * and secondary keys exist, but it is simpler to just be permissive.
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDATA_KEYDEF.html
     */
    table_key: $ => seq(
        optional(field("unique", choice($.unique, $.non_unique))),
        optional(field("kind", choice($.hashed, $.sorted))),
        choice(
            $.default_key,
            $.__key_body
        )
    ),

    // KEY key_name [ALIAS alias_name] COMPONENTS comp1 comp2
    __key_body: $ => prec(1, seq(
        gen.kw("key"),
        optional(field("name", $.identifier)),
        optional(alias($.__key_alias, $.alias)),
        $.key_components
    )),

    // [COMPONENTS] comp1 comp2
    key_components: $ => prec.right(seq(
        optional(gen.kw("components")),
        repeat1($.identifier)
    )),

    empty_key: _ => seq(...gen.kws("empty", "key")),

    default_key: _ => seq(...gen.kws("default", "key")),

    unique: _ => gen.kw("unique"),

    non_unique: _ => gen.kw("non-unique"),

    sorted: _ => gen.kw("sorted"),

    hashed: _ => gen.kw("hashed"),

    standard_table: _ => seq(...gen.kws(optional("standard"), "table")),

    sorted_table: _ => seq(...gen.kws("sorted", "table")),

    hashed_table: _ => seq(...gen.kws("hashed", "table")),

    any_table: _ => seq(...gen.kws("any", "table")),

    index_table: _ => seq(...gen.kws("index", "table")),

    further_secondary_keys: _ => seq(
        choice(...gen.kws("with", "without")),
        ...gen.kws("further", "secondary", "keys"),
    ),

    /**
     * ... { {[STANDARD] TABLE} 
     *     / {SORTED TABLE} 
     *     / {HASHED TABLE} 
     *     / {ANY TABLE} 
     *     / {INDEX TABLE} } ...
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPTYPES_TABCAT.html
     */
    __table_category: $ => choice(
        $.standard_table,
        $.sorted_table,
        $.hashed_table,
        $.any_table,
        $.index_table
    ),

    __table_type_addition: $ => choice(
        $.with_header_line,
        $.with_table_key,
        $.initial_value,
        $.read_only,
        $.initial_size,
        $.further_secondary_keys,
        $.occurs // technically obsolete
    ),

    /**
     * Specification of a generic table
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENBUILT_IN_TYPES_GENERIC.html
     */
    __generic_table_type: $ => seq(
        gen.kw("type"),
        field("kind", $.__table_category)
    ),

    // { {TYPE [STANDARD]|SORTED|HASHED TABLE OF [REF TO] type}
    __table_type_spec: $ => seq(
        gen.kw("type"),
        field("kind", $.__table_category),
        gen.kw("of"),
        field("line_type", choice(
            alias($._inline_ref_type_spec, $.ref_type_spec),
            $._type_identifier,
            $.type_component_selector,
        )),
    ),

    // {LIKE [STANDARD]|SORTED|HASHED TABLE OF dobj} }
    __table_like_spec: $ => seq(
        gen.kw("like"),
        field("kind", $.__table_category),
        gen.kw("of"),
        field("line_type", choice(
            alias($._inline_ref_data_spec, $.ref_type_spec),
            $.identifier,
            $.data_component_selector,
        )),
    ),

    // [ALIAS alias_name]
    __key_alias: $ => seq(
        gen.kw("alias"),
        field("name", $.identifier)
    )

}