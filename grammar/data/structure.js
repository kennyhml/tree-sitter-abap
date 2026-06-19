module.exports = {

    // TYPES BEGIN OF struc_type. 
    begin_of_struct: $ => seq(
        ...gen.kws("begin", "of"),
        field("name", $.identifier)
    ),

    // TYPES END OF struc_type.
    end_of_struct: $ => seq(
        ...gen.kws("end", "of"),
        field("name", $.identifier)
    ),

    /**
     * INCLUDE { {TYPE struc_type} 
     *         / {STRUCTURE struc} } 
     *         [AS name [RENAMING WITH SUFFIX suffix]].
     * 
     * Decided to split this into two individual nodes for better
     * readability in the CST.
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPINCLUDE_TYPE.html
     */
    include_type: $ => seq(
        ...gen.kws("include", "type"),
        field("name", $.identifier),
        optional($.include_alias),
        optional($.renaming_with_suffix)
    ),

    include_structure: $ => seq(
        ...gen.kws("include", "structure"),
        field("name", $.identifier),
        optional($.include_alias),
        optional($.renaming_with_suffix),
    ),

    include_alias: $ => seq(
        gen.kw("as"),
        field("alias", $.identifier),
    ),

    renaming_with_suffix: $ => seq(
        ...gen.kws("renaming", "with", "suffix"),
        field("suffix", $.identifier)
    ),

}
