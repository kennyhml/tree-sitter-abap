const DOCSTRING_SYMBOL = "\"!";

module.exports = {

    /**
     * Docstring (modern abap). Due to the more complex nature of its synatx, its not 
     * 'extra-compatible'. However, since its designed to appear before declarations,
     * it is trivially checked in the correct positions.
     * 
     * While HTML is allowed in the docstrings, theres not really any reason for us to
     * actually parse said html to produce anything meaningful. The main thing we care about
     * is the non-html features such as linking other components or listing parameters, etc.
     * 
     * TODO: 
     * The special characters ", ', <, >, @, {, |, and } can, if necessary, be escaped 
     * using &quot;, &apos;, &lt;, &gt;, &#64;, &#123;, &#124;, and &#125;.
     * 
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENDOCCOMMENT.html
     *
     */
    docstring: $ => seq(
        DOCSTRING_SYMBOL,
        optional($.__docstring_line_content),
        // subsequent lines need special external continuation handling
        repeat(
            seq(
                alias($._docstring_continuation, DOCSTRING_SYMBOL),
                optional($.__docstring_line_content)
            )
        ),
    ),

    /**
     * Handles a line of a docstring, a line can either contain a single
     * doctag, which itself contains paragraphs, or a mix of doclinks
     * and paragraphs.
     */
    __docstring_line_content: $ => seq(
        // Preconsume any leading whitespaces to get a cleaner result. 
        // Otherwise, something like ` @parameter` could get captured.
        /[ \t]*/,
        optional(
            choice(
                $.doctag,
                $.paragraph,
            )
        )
    ),

    /**
     * A paragraph of documentation, within a single line of the docstring.
     * 
     * Example:
     * ```
     * "! This method provides an instance of {@link cl_abap_browser} for use.
     *    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ ----------------------  ^^^^^^^
     *              text                              doclink           text
     * ```
     * If the paragraph is continued in the next line of the docstring, it will
     * be a seperate node. This is due to the intention to avoid making the `"!"`
     * line start part of the paragraph, which it technically isnt.
     * 
     * So a docstring such as
     * ```
     * "!  This is the first line of my awesome docstring
     * "!  that continues into this second line for no reason!
     * ```
     * Is represented as two seperate paragraph nodes, even semantically they are
     * one paragraph.
     */
    paragraph: $ => repeat1(
        choice(
            // Looks a little intimidating but is pretty straight forward, we
            // need to make sure the first character isnt a doclink or a doctag
            // so not @, { or } and then just consume until we hit a newline or a doclink.
            // Since doctags may only appear at the start, we no longer worry about that.
            token.immediate(/(?:\\[{}]|[^@{}\n\r])(?:\\[{}]|[^{}\n\r])*/),
            $.doclink,
        )
    ),
}