const SYMBOL_ID_REGEX = /[a-zA-Z\d]{3}/;

module.exports = {
    /**
     * Syntactically the same as struct component selectors, with the
     * exception that text symbols can start with numbers. Its also 
     * possible to append them to a literal string which will then
     * serve as the 'default value'.
     * 
     * ... text-idf ... / ... 'Literal'(idf) ...
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENTEXT_SYMBOLS.html
     */
    text_symbol: $ => choice(
        $.__tagged_literal,
        $.__text_pool_symbol
    ),

    __tagged_literal: $ => seq(
        field("literal", $.string_literal),
        gen.immediateTightParens(field("id", $.symbol_id))
    ),

    __text_pool_symbol: $ => seq(
        alias(gen.caseInsensitive('text'), $.identifier),
        token.immediate("-"),
        field("id", $.symbol_id)
    ),

    // This needs a higher lexical precedence, otherwise the number
    // regex will eat it up if it starts with a digit.
    symbol_id: _ => token.immediate(prec(1, SYMBOL_ID_REGEX)),
}