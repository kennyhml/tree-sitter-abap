const { kw, kws } = require("../../helpers/keywords.js")


module.exports = {

    /**
     * Raising of non class-based exceptions (sy-subrc).
     * 
     * RAISE exception.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPRAISE_EXCEPTION.html
     */
    raise_statement: $ => seq(
        kw("raise"),
        field("name", $.identifier)
    ),

    /**
     * Raising of class-based exceptions.
     * 
     * RAISE [RESUMABLE] EXCEPTION 
     *   { {TYPE cx_class [message] [EXPORTING p1 = a1 p2 = a2 ...]} 
     *     / oref }.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPRAISE_EXCEPTION_CLASS.html 
     */
    raise_exception_statement: $ => seq(
        kw("raise"),
        optional($.resumable_spec),
        kw("exception"),
        field("exception", choice(
            $.general_expression,
            $.new_exception_spec
        ))
    ),

    // {TYPE cx_class [message] [EXPORTING p1 = a1 p2 = a2 ...]
    new_exception_spec: $ => prec.right(seq(
        kw("type"),
        field("class_name", $.identifier),
        optional($.__construct_from_message),
        optional($.__exception_argument_list)
    )),

    // For some reason 'using message' went missing from the docs, but it
    // just uses the system message fields (sy-msgid, etc..)
    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPRAISE_EXCEPTION_MESSAGE.html
    using_message_spec: _ => seq(...kws("using", "message")),

    resumable_spec: _ => kw("resumable"),

    /**
     * A message specification that is inlined into another statement, e.g
     * a {@link throw_exception} or {@link raise_exception} and preceded by
     * a 'message' keyword that doesnt technically serve as a declaration.
     * 
     * TODO: Move this to messages
     */
    inline_message_spec: $ => seq(
        kw("message"),
        field("message", $.message_spec)
    ),

    __construct_from_message: $ => choice(
        $.using_message_spec,
        $.inline_message_spec
    ),

    __exception_argument_list: $ => seq(
        kw("exporting"),
        field("exporting", $._named_argument_list)
    )
}
