const gen = require('../generators.js');


module.exports = {

    /**
     * Specification of a builtin type (also alled abap_type)
     * 
     * TYPES { {dtype[(len)] TYPE abap_type [DECIMALS dec]} 
     *     / {dtype TYPE abap_type [LENGTH len] [DECIMALS dec]}}.
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDATA_SIMPLE.html
     */
    abap_type: $ => prec.right(seq(
        choice(
            seq(
                optional($.parenthesized_length),
                $.__abap_type_body
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

    __abap_type_body: $ => seq(
        gen.kw("type"),
        field("name", $.__abap_type_identifier),
    ),

    __abap_type_additions: $ => choice(
        $.type_length,
        $.type_decimals,
        $.initial_value,
        $.default_data_value,
        $.read_only
    ),

    /**
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENBUILTIN_ABAP_TYPE_GLOSRY.html
     */
    __abap_type_identifier: $ => prec(1, alias(choice(
        ...gen.caseInsensitive(
            "b",
            "c",
            "d",
            "decfloat16",
            "decfloat34",
            "f",
            "i",
            "int8",
            "n",
            "p",
            "s",
            "string",
            "t",
            "utclong",
            "x",
            "xstring"
        )
    ), $.type_identifier)),

}
