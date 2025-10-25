/**
 * @file Abap grammar for tree-sitter
 * @author Kendrick Hommel <kendrick.hommel@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-nocheck
module.exports = grammar({
  name: "abap",

  externals: $ => [
    /**
     * The line comment is initiated with a '*' character which has to be in
     * the first column of the line. Tree sitter does not provide any way to
     * enforce column position other than using an external scanner.
     */
    $._begin_line_comment,
    /**
     * For some reason, when using a regex to parse out newlines / whitespaces, 
     * treesitter doesnt give the external scanner control sometimes and we cant
     * correctly identify the start of a comment.
     */
    $._whitespace,
    $._error_sentinel,
  ],

  extras: $ => [
    /**
     * ABAP is whitespace sensitive in certain places, so its a little awkward.
     * 
     * There are scenarios in which there can be 0 to n whitespaces, e.g
     * ... into table @itab.
     * or                  ^    v
     * ... into table @itab     .
     * are both valid, this is easily taken care of by just allowing extras.
     * 
     * On the other hand, there are situations where n must be 0:
     * data(foo) = ... is valid, unlike any of data (foo), data( foo), etc..
     * 
     * This can be solved carefully using token.immediate as long as the token is a terminal.
     * 
     * And finally, scenarios where n must be >= 1:
     * ... = foo->bar( ).
     * 
     * Which must sometimes be manually enforced.
     * 
     */
    $._whitespace,
    $.comment,
  ],

  supertypes: $ => [
    $._simple_statement,
    $._compound_statement
  ],

  // This makes sure that tree-sitter initially also parses keywords as 
  // identifiers and THEN checks whether it is a keyword in its entirety.
  word: $ => $.identifier,

  rules: {
    source: $ => repeat($._statement),

    _statement: $ => choice(
      $._simple_statement
    ),

    // Statements that dont contain a body/block. For example a data declaration.
    // method definitions, import statements, etc..
    _simple_statement: $ => choice($.data_declaration, $.inline_declaration),

    inline_declaration: $ => seq(
      choice(insensitiveAliased("data"), insensitiveAliased("final")),
      token.immediate("("),
      field("name", $._immediate_identifier),
      token.immediate(")"),

      optional(seq(
        "=",
        field("value", $._expression),
        "."
      ))
    ),

    // Statements that start a block and have a body. For example method implementations,
    // class /function definitions and implementations, etc..
    _compound_statement: $ => choice(),

    _expression: $ => choice($.literal_int, $.literal_string),

    data_declaration: $ => seq(
      insensitiveAliased("data"),
      field("name", $.identifier),
      optional(field("bufsize", seq(
        token.immediate("("),
        alias(token.immediate(/-?\d+/), $.literal_int),
        token.immediate(")"))
      )),

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
            field("readonly", insensitiveAliased("read-only")),
          )
        )
      ),
      ".",
    ),

    _type_reference: $ => seq(insensitiveAliased("type"), $.type),
    _like_reference: $ => seq(insensitiveAliased("like"), $.identifier),


    //FIXME: Constants are also possible
    _data_value: $ => seq(
      insensitiveAliased("value"),
      choice($.literal_string, $.literal_int, seq(insensitiveAliased("is"), insensitiveAliased("initial")))
    ),
    _data_length: $ => seq(insensitiveAliased("length"), choice($.literal_int, $.literal_string)),
    _data_decimals: $ => seq(insensitiveAliased("decimals"), $.literal_int),

    type: $ => /[a-zA-Z\/][a-zA-Z0-9_\/-]*/,
    identifier: $ => /[a-zA-Z_\/][a-zA-Z0-9_\/-]*/,
    field_symbol: $ => /[a-zA-Z][a-zA-Z0-9_\/-<>]*/,

    _immediate_identifier: $ => alias(token.immediate(/[a-zA-Z_\/][a-zA-Z0-9_\/-]*/), $.identifier),

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

    comment: $ => choice(
      $._inline_comment,
      seq($._begin_line_comment, /[^\n\r]*/),
    ),

    _inline_comment: _ => token(seq('"', /[^\n\r]*/)),
  }

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

function whitespace_separated(...args) {
  return seq(
    ...args.flatMap((item, index) => index === 0 ? [item] : [repeat1(/\s/), item])
  )
}

/**
 * Wraps a rule to enforce that it is followed by one or more whitespaces.
 * 
 * @param {Rule} rule The rule to wrap, e.g $.identifier
 * 
 * @returns A new `seq` rule followed by a `repeat1` rule for whitspaces.
 */
function rws(rule) {
  return seq(rule, repeat1(/\s/));
}

/**
 * Wraps a rule to enforce that it is preceded by one or more whitespaces.
 * 
 * @param {Rule} rule The rule to wrap, e.g $.identifier
 * 
 * @returns A new `seq` rule preceded by a `repeat1` rule for whitspaces.
 */
function lws(rule) {
  return seq(repeat1(/\s/), rule);
}

/**
 * Wraps a rule to consume optional whitespaces that may or may not precede it.
 * 
 * @param {Rule} rule The rule to wrap, e.g $.identifier
 * 
 * @returns A new `seq` rule preceded by a `repeat` rule for whitspaces.
 */
function opt_lws(rule) {
  return seq(repeat(/\s/), rule);
}