module.exports = {

    /**
     * In an ABAP Doc comment, the following syntax can be used to refer to 
     * the documentation of other repository objects:
     * 
     * {@link [[[kind:]name.]...][kind:]name} ...
     */
    doclink: $ => seq(
        token.immediate("{"),
        "@link",
        $.linked_object_path,
        "}",
    ),

    linked_object_path: $ => prec.right(choice(
        field("locator", $.linked_node),
        seq(
            choice(
                seq(
                    field("locator", choice(
                        $.linked_object_path,
                        $.linked_node,
                    )),
                    ".",
                ),
                field("locator", $.scope_directive)
            ),
            field("component", $.linked_node)
        )
    )),

    linked_node: $ => seq(
        optional(
            seq(
                field("kind", $.linked_object_kind),
                token.immediate(':'),
            )
        ),
        field("name", $.identifier)
    ),

    scope_directive: _ => prec.left(repeat1(".")),

    linked_object_kind: _ => choice(...gen.caseInsensitive(
        "data", // constants, variables, procedure parameters
        "doma", // ddic domains
        "evnt", // class based events
        "func", // function modules in function pools
        "form", // subroutines in programs
        "fugr", // function pools
        "intf", // interfaces implemented in a class
        "meth", // methods
        "prog", // abap programs
        "seam", // test seams
        "xslt"  // xslt programs and simple transformations
    )),
}