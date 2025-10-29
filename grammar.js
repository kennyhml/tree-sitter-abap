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
    _simple_statement: $ => choice(
      $.data_declaration,
      $.inline_declaration,
      $.report_statement
    ),

    inline_declaration: $ => seq(
      choice(kw("data"), kw("final")),
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

    _expression: $ => choice($.number, $.literal_string),

    _scalar_declaration_body: $ => seq(
      optional(field("bufsize", seq(
        token.immediate("("),
        alias(token.immediate(/-?\d+/), $.number),
        token.immediate(")"))
      )),
      repeat1(
        choice(
          field("type", $._type_reference),
          field("like", $._like_reference),
          field("length", $._data_length),
          field("value", $._data_value),
          field("decimals", $._data_decimals),
          field("readonly", kw("read-only")),
        )
      )
    ),

    _struct_field: $ => choice(
      $.struct_data_spec,
      $.data_spec
    ),

    /**
     * Two ways to declare data structures:
     * 
     * The old & more verbose version
     * ```
     * DATA BEGIN OF xyz.
     * DATA field1.
     * DATA field2 TYPE i.
     * DATA END OF xyz.
     * ``` 
     * And the modern, concise version:
     * ```
     * ```
     * DATA: BEGIN OF xyz,
     *       field1,
     *       field2 TYPE i,
     *       END OF xyz.
     * ```
     */
    struct_data_spec: $ => choice(
      $._struct_data_spec_collapsed,
      $._struct_data_spec_expanded
    ),

    _struct_data_spec_collapsed: $ => seq(
      ...kws("begin", "of"),
      field("nameOpen", $.identifier),
      optional(kw("read-only")), ",",
      repeat(seq(field("field", $._struct_field), ",")),
      ...kws("end", "of"),
      field("nameClose", $.identifier)
    ),

    _struct_data_spec_expanded: $ => seq(
      ...kws("begin", "of"),
      field("nameOpen", $.identifier),
      optional(kw("read-only")), ".",
      repeat(seq(kw("data"), field("field", $._struct_field), ".")),
      ...kws("data", "end", "of"),
      field("nameClose", $.identifier)
    ),

    data_spec: $ => seq(
      field("name", $.identifier),
      optional($._scalar_declaration_body)
    ),

    data_declaration: $ => seq(
      kw("data"),
      choice(
        // In case of `data:`, multiple specs and structs are possible
        seq(
          ":",
          commaSep1(
            choice(
              $.data_spec,
              alias($._struct_data_spec_collapsed, $.struct_data_spec)
            )
          ),
        ),
        $.data_spec,
        alias($._struct_data_spec_expanded, $.struct_data_spec)
      ),
      "."
    ),

    report_statement: $ => seq(kw("report"), $.identifier, "."),

    _type_reference: $ => seq(kw("type"), $.type),
    _like_reference: $ => seq(kw("like"), $.identifier),


    //FIXME: Constants are also possible
    _data_value: $ => seq(
      kw("value"),
      choice($.literal_string, $.number, seq(kw("is"), kw("initial")))
    ),
    _data_length: $ => seq(kw("length"), choice($.number, $.literal_string)),
    _data_decimals: $ => seq(kw("decimals"), $.number),

    type: $ => /[a-zA-Z\/][a-zA-Z0-9_\/-]*/,
    identifier: $ => /[a-zA-Z_\/][a-zA-Z0-9_\/-]*/,
    field_symbol: $ => /[a-zA-Z][a-zA-Z0-9_\/-<>]*/,
    number: $ => /-?\d+/,

    _immediate_identifier: $ => alias(token.immediate(/[a-zA-Z_\/][a-zA-Z0-9_\/-]*/), $.identifier),
    _immediate_number: $ => alias(token.immediate(/-?\d+/), $.number),

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

    comment: $ => choice(
      $._inline_comment,
      seq($._begin_line_comment, /[^\n\r]*/),
    ),

    _inline_comment: _ => token(seq('"', /[^\n\r]*/)),
  }

});


/**
 * @param {string} keyword 
 * @returns {AliasRule}
 */
function kw(keyword) {
  let result = new RustRegex(keyword
    .split('')
    .map(l => l !== l.toUpperCase() ? `[${l}${l.toUpperCase()}]` : l)
    .join('')
  )
  return alias(result, keyword);
}
/**
 * @param {string[]} keywords
 * 
 * @returns {Rule[]}
 */
function kws(...keywords) {
  return keywords.map(kw)
}

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)))
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