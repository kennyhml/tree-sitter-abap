/**
 * @file Abap grammar for tree-sitter
 * @author Kendrick Hommel <kendrick.hommel@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-nocheck
module.exports = grammar({
  name: "abap",

  extras: $ => [
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
     * On the other hand, there are situations where n must be 0:
     * data(foo) = ... is valid, unlike any of data (foo), data( foo), etc..
     * 
     * And finally, scenarios where n must be >= 1:
     * ... = foo->bar( ).
     */
    /[\s\f\uFEFF\u2060\u200B]|\r?\n/,
  ],

  conflicts: $ => [
    [$.source],
  ],

  supertypes: $ => [
    $._simple_statement,
    $._compound_statement
  ],

  // This makes sure that tree-sitter initially also parses keywords as 
  // identifiers and THEN checks whether it is a keyword in its entirety.
  word: $ => $.identifier,

  rules: {
    source: $ =>
      seq(
        repeat($._linespace),
        optional(seq(
          $._statement,
          repeat(seq(
            repeat($._linespace),
            $._statement,
          )),
        )),
        repeat($._linespace),
      ),

    _statement: $ => choice(
      $._simple_statement
    ),

    // Statements that dont contain a body/block. For example a data declaration.
    // method definitions, import statements, etc..
    _simple_statement: $ => choice($.data_declaration, $.inline_declaration),

    inline_declaration: $ => seq(
      choice(insensitiveAliased("data"), insensitiveAliased("final")),
      "(", field("name", $.identifier), ")",

      optional(seq(
        lws("="),
        field("value", lws($._expression)),
        opt_lws(".")
      ))
    ),

    // Statements that start a block and have a body. For example method implementations,
    // class /function definitions and implementations, etc..
    _compound_statement: $ => choice(),

    _expression: $ => choice($.literal_int, $.literal_string),

    data_declaration: $ => seq(
      rws(insensitiveAliased("data")),
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
            field("type", lws($._type_reference)),
            field("like", lws($._like_reference)),
            field("length", lws($._data_length)),
            field("value", lws($._data_value)),
            field("decimals", lws($._data_decimals)),
            field("readonly", lws(insensitiveAliased("read-only"))),
          )
        )
      ),
      opt_lws("."),
    ),

    _type_reference: $ => seq(rws(insensitiveAliased("type")), $.type),
    _like_reference: $ => seq(rws(insensitiveAliased("like")), $.identifier),


    //FIXME: Constants are also possible
    _data_value: $ => seq(
      rws(insensitiveAliased("value")),
      choice($.literal_string, $.literal_int, seq(rws(insensitiveAliased("is")), insensitiveAliased("initial")))
    ),
    _data_length: $ => seq(rws(insensitiveAliased("length")), choice($.literal_int, $.literal_string)),
    _data_decimals: $ => seq(rws(insensitiveAliased("decimals")), $.literal_int),

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

    _linespace: $ => choice($._newline, $._ws),

    _newline: _ => choice(/\r'/, /\n/, /\r\n/, /\u0085/, /\u000C/, /\u2028/, /\u2029/),

    _ws: $ => choice($._bom, $._unicode_space),

    _bom: _ => /\u{FEFF}/,

    _unicode_space: _ =>
      /[\u0009\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000]/,
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