const gen = require("../generators.js")

module.exports = {

    /**
     * SHIFT dobj [ {[places][direction]} | deleting] 
     *              [IN {CHARACTER|BYTE} MODE].
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSHIFT.html
     */
    shift_statement: $ => seq(
        gen.kw("shift"),
        field("subject", $.data_object),
        repeat($.__shift_addition),
        "."
    ),

    __shift_addition: $ => choice(
        $.shift_direction_spec,
        $.shift_left_deleting_spec,
        $.shift_right_deleting_spec,
        $.shift_by_spec,
        $.shift_up_to_spec,
        $.string_processing_spec
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSHIFT_PLACES.html
    shift_by_spec: $ => seq(
        gen.kw("by"),
        field("amount", $.numeric_expression),
        gen.kw("places"),
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSHIFT_PLACES.html
    shift_up_to_spec: $ => seq(
        ...gen.kws("up", "to"),
        field("substring", $.character_like_expression),
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSHIFT_DIRECTION.html
    shift_direction_spec: _ => prec.right(
        repeat1(
            choice(
                field("direction", choice(...gen.kws("left", "right"))),
                gen.kw("circular")
            )
        )
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSHIFT_DELETING.html
    shift_left_deleting_spec: $ => seq(
        ...gen.kws("left", "deleting", "leading"),
        field("mask", $.character_like_expression)
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSHIFT_DELETING.html
    shift_right_deleting_spec: $ => seq(
        ...gen.kws("right", "deleting", "trailing"),
        field("mask", $.character_like_expression)
    ),


}