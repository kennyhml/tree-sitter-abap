module.exports = {

    doctag: $ => choice(
        seq(
            field("name", alias(token(/@(parameter|raising|exception)/), $.tag)),
            token.immediate(/[ \t]+/),
            field("value", $.identifier),
            token.immediate(/[ \t]+[\|]*[ \t]*/),
            optional(field("documentation", $.paragraph))
        ),
        prec.left(seq(
            field("name", alias('@testing', $.tag)),
            field("value", $.linked_object_path),
            token.immediate(/[ \t]*/),
            optional(field("documentation", $.paragraph))
        )),
        // Custom tags, not technically a thing but might as well?.. always wanted this :D
        seq(
            field("name", alias(token(/@[a-zA-Z]+/), $.tag)),
            token.immediate(/[ \t]*/),
            optional(field("documentation", $.paragraph))
        )
    )

}