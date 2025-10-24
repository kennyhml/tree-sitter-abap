/**
 * @file Abap grammar for tree-sitter
 * @author Kendrick Hommel <kendrick.hommel@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check
module.exports = grammar({
  name: "abap",

  externals: $ => [
    /**
     * ABAP is whitespace sensitive in SOME places, so letting the grammar 
     * discard whitespaces as if they didnt exist per default wont cut it.
     * 
     * There are scenarios in which there can be 0 to n whitespaces, e.g
     * ... into table @itab.
     * or                  ^    v
     * ... into table @itab     .
     * are both valid.
     * 
     * For these cases, the external scanner can just regularly emits the whitespaces.
     * 
     * On the other hand, there are situations where n must be 0:
     * data(foo) = ... is valid, unlike any of data (foo), data( foo), etc..
     * 
     * Which can sometimes be solved using token.immediate and other times requires
     * the external scanner for context.
     * 
     * And finally, scenarios where n must be >= 1:
     * ... = foo->bar( ).
     *                ^
     * Which can be solved by explicitly demanding at least one WS in the rules.
     */
    $._whitespace,
    $._error_sentinel,
  ],

  extras: $ => [
    $._whitespace,
    $.comment,
  ],

  supertypes: $ => [
    $._simple_statement,
    $._compound_statement
  ],


  rules: {
    source: $ => repeat(
      $._statement
    ),

    _statement: $ => choice(
      $._simple_statement
    ),

    // Statements that dont contain a body/block. For example a data declaration.
    // method definitions, import statements, etc..
    _simple_statement: $ => choice($.inline_declaration, $.data_declaration, $.inline_decl_assignment),

    // Statements that start a block and have a body. For example method implementations,
    // class /function definitions and implementations, etc..
    _compound_statement: $ => choice(),

    inline_declaration: $ => seq(
      choice(insensitiveAliased("data"), insensitiveAliased("final")),
      token.immediate("("),
      field("name", $.identifier),
      token.immediate(")"),
    ),

    inline_decl_assignment: $ => prec(10, seq(
      choice(insensitiveAliased("data"), insensitiveAliased("final")),
      token.immediate("("),
      field("name", $.identifier),
      token.immediate(")"),

      "=",

      field("value", $._expression),
      "."
    )),

    _expression: $ => choice($.literal_int, $.literal_string),

    data_declaration: $ => seq(
      insensitiveAliased("data"),
      field("name", $.identifier),
      optional(field("bufsize", seq("(", $.literal_int, ")"))),

      // Its actually possible to define data with nothing but `data foo.` which will be a C1.
      // Any of the below keywords can come in literally ANY order and all are optional.
      // Yes, you can specify read-only before you specify even the type of the variable T.T
      // There IS some post processing that needs to be done. Particularly, the `length` specifier
      // is only valid for certain types and the `read-only` modifier only works in classes.
      // But since tree-sitter is inherently context free, it is easier to treat it as valid
      // syntax and then catch those errors in post processing.
      optional(
        repeat(
          choice(
            field("type", $._type_reference),
            field("like", $._like_reference),
            field("length", $._data_length),
            field("value", $._data_value),
            field("decimals", $._data_decimals),
            field("readonly", seq(insensitiveAliased("read-only"))),
          )
        )
      ),
      ".",
    ),

    _type_reference: $ => seq(insensitiveAliased("type"), $.type),
    _like_reference: $ => seq(insensitiveAliased("like"), $.identifier),


    //FIXME: Constants are also possible
    _data_value: $ => seq(insensitiveAliased("value"), choice($.literal_string, seq(insensitiveAliased("is"), insensitiveAliased("initial")))),
    _data_length: $ => seq(insensitiveAliased("length"), choice($.literal_int, $.literal_string)),
    _data_decimals: $ => seq(insensitiveAliased("decimals"), $.literal_int),

    type: $ => /[a-zA-Z\/][a-zA-Z0-9_\/-]*/,
    identifier: $ => /[a-zA-Z_\/][a-zA-Z0-9_\/-]*/,
    field_symbol: $ => /[a-zA-Z][a-zA-Z0-9_\/-<>]*/,

    literal_string: $ => choice(
      seq(
        "'",
        field("content", /[^']*/), // Match any characters except the closing quote
        "'"
      ),
      seq(
        "`",
        field("content", /[^`]*/),
        "`"
      )
    ),
    literal_int: $ => /-?\d+/,

    // Enforces that at least one whitespace is present, but more are ok.
    _at_least_one_ws: $ => /\s+/,

    comment: _ => token(seq(choice('*', '"'), /[^\n\r]*/)),
  },
});


// @ts-check
/**
 * @param {string} keyword 
 * @returns {AliasRule}
 */
function insensitiveAliased(keyword) {
  let result = new RustRegex(keyword
    .split('')
    .map(l => l !== l.toUpperCase() ? `[${l}${l.toUpperCase()}]` : l)
    .join('')
  )
  return alias(result, keyword);
}