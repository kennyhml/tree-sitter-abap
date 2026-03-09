module.exports = {

    /**
     * ... ##code[par][par]...
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENPRAGMA.html
     */
    pragma: $ => seq(
        '##',
        field("code", alias(token.immediate(/[^\n\r#. ]+/), $.identifier)),
        // Up to 2 parameters are possible, but extras dont allow optionals.
        // While this hack does work fine, it unfortunately causes the parameter nodes
        // to always show up in the tree even when no parameter are specified.
        // So im not sure if I want to have it that way.
        /\[?/,
        field("parameter", alias(token.immediate(/[^\n\r\]]*/), $.identifier)),
        /\]?/,
        /\[?/,
        field("parameter", alias(token.immediate(/[^\n\r\]]*/), $.identifier)),
        /\]?/,
    ),
}