/**
 * @file Abap grammar for tree-sitter
 * @author Kendrick Hommel <kendrick.hommel@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "abap",

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => "hello"
  }
});
