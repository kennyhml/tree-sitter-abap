/**
 * @file Abap grammar for tree-sitter
 * @author Kendrick Hommel <kendrick.hommel@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check


const CONSUME_ANY_WS = repeat(/\s+/);

module.exports = grammar({
  name: "abap",
  extras: $ => [
    // Unfortunately, abap is in fact whitespace sensitive, so letting the parser
    // discard whitespaces as if they didnt exist wont cut it.
    //
    // For example, inline declarations:
    // data(num)    -> valid syntax
    // data( num)   -> invalid syntax
    // data (num)   -> invalid syntax
    // 
    // Or also method / function calls:
    // obj->foo( ) -> valid syntax
    // obj->foo()  -> invalid syntax
  ],

  supertypes: $ => [
    $._simple_statement,
    $._compound_statement
  ],

  conflicts: $ => [
    [$.inline_declaration, $.inline_decl_assignment]
  ],

  rules: {
    source: $ => repeat(seq(
      // Indentation in abap never matters.
      CONSUME_ANY_WS,
      // There is no guarantee a statement is in this line, it could be empty.
      $._statement
    )),

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
      choice(/data/i, /final/i),
      "(",
      field("name", $.identifier),
      ")",
    ),

    inline_decl_assignment: $ => seq(
      choice(/data/i, /final/i),
      "(",
      field("name", $.identifier),
      ")",
      $._at_least_one_ws,
      "=",
      $._at_least_one_ws,
      field("value", $._expression),
      CONSUME_ANY_WS,
      "."
    ),

    _expression: $ => choice($.literal_int, $.literal_string),

    data_declaration: $ => seq(
      /data/i,
      $._at_least_one_ws,
      field("name", $.identifier),
      $._at_least_one_ws,
      /type/i,
      $._at_least_one_ws,
      field("type", $.type_reference),
      optional(
        repeat1(
          choice(
            field("length", $._data_length),
            field("value", $._data_value),
            field("decimals", $._data_decimals)
          )
        )
      ),
      field("readonly", optional(seq($._at_least_one_ws, /read-only/i))),
      CONSUME_ANY_WS,
      ".",
    ),


    //FIXME: Constants are also possible
    _data_value: $ => seq($._at_least_one_ws, /value/i, $._at_least_one_ws, choice($.literal_string, seq(/is/i, $._at_least_one_ws, /initial/i))),
    _data_length: $ => seq($._at_least_one_ws, /length/i, $._at_least_one_ws, choice($.literal_int, $.literal_string)),
    _data_decimals: $ => seq($._at_least_one_ws, /decimals/i, $._at_least_one_ws, $.literal_int),


    type_reference: $ => /[a-zA-Z\/][a-zA-Z0-9_\/-]*/,

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
  },
});
