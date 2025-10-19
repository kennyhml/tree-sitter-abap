/**
 * @file Abap grammar for tree-sitter
 * @author Kendrick Hommel <kendrick.hommel@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

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

  rules: {
    source: $ => repeat(seq(
      repeat($._at_least_one_ws),
      $._statement,
    )

    ),

    _statement: $ => choice(
      $._simple_statement
    ),

    // Statements that dont contain a body/block. For example a data declaration.
    // method definitions, import statements, etc..
    _simple_statement: $ => choice($.inline_declaration, $.data_declaration),

    // Statements that start a block and have a body. For example method implementations,
    // class /function definitions and implementations, etc..
    _compound_statement: $ => choice(),

    inline_declaration: $ => seq(
      choice(/data/i, /final/i),
      "(",
      field("name", $.identifier),
      ")"
    ),

    data_declaration: $ => seq(
      // final declarations are only possible as inline decls.
      /data/i,
      $._at_least_one_ws,
      field("name", $.identifier),
      $._at_least_one_ws,
      /type/i,
      $._at_least_one_ws,
      field("type", $.type_reference),
      repeat($._at_least_one_ws),
      ".",
    ),

    type_reference: $ => /[a-zA-Z][a-zA-Z0-9_\/-]*/,

    identifier: $ => /[a-zA-Z_\/][a-zA-Z0-9_\/-]*/,
    field_symbol: $ => /[a-zA-Z][a-zA-Z0-9_\/-<>]*/,

    // Enforces that at least one whitespace is present, but more are ok.
    _at_least_one_ws: $ => /\s+/,

    // Consumes any number of whitespaces, or none. For example, the dot (.) to
    // terminate might be directly after the last token or with n spaces between.
    // _optional_ws: $ => repeat1(' ')
  },
});
