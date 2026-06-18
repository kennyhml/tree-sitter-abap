module.exports = {

    /**
     * Code Inspector: ... "#EC CI_...
     * Test Classes (obsolete): ... "#AU Risk_Level Critical|Dangerous|Harmless
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abenpseudo_comment.html
     */
    pseudo_comment: $ => prec(1, seq(
        '"#',
        field("kind", alias(token.immediate(/[^ ]{2}/), $.identifier)),
        field("code", alias(/[^\n\r]*/, $.identifier))
    )),

}