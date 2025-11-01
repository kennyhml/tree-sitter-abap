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
      $.type_declaration,
      $.report_initiator
    ),

    // Statements that start a block and have a body. For example method implementations,
    // class /function definitions and implementations, etc..
    _compound_statement: $ => choice(),

    data_declaration: $ => oneOrMoreDeclarations("data", $.data_spec),

    type_declaration: $ => oneOrMoreDeclarations("types", $.type_spec),

    data_spec: $ => choice(
      $._simple_data_spec,
      $._complex_data_spec,
    ),

    type_spec: $ => choice(
      $._simple_type_spec,
      $._complex_type_spec,
    ),

    _simple_data_spec: $ => seq(
      field("name", $.identifier),
      optional(field("bufsize", seq(
        token.immediate("("),
        alias(token.immediate(/-?\d+/), $.number),
        token.immediate(")"))
      )),
      optional(field("type", $._type_clause)),
    ),

    /**
     * Specification for a single, simple type initiated by a {@link type_declaration}.
     * 
     * This includes any type / like references but NOT structure types.
     */
    _simple_type_spec: $ => seq(
      field("name", $.typename),
      // just like data, literally just `types foo.` is valid and sets it to C1.
      optional(field("type", $._type_clause)),
    ),

    _complex_data_spec: $ => choice(
      structureSpec(",", $.identifier, undefined, $.data_spec, $),
      structureSpec(".", $.identifier, "data", $.data_spec, $)
    ),

    /**
     * Specification for a single, complex type initiated by a {@link type_declaration}.
     * 
     * More accurately, this currently only encompasses structure specifications.
     */
    _complex_type_spec: $ => choice(
      structureSpec(",", $.typename, undefined, $.data_spec, $),
      structureSpec(".", $.typename, "types", $.data_spec, $)
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREPORT.html
    report_initiator: $ => seq(
      kw("report"),
      $.identifier,
      repeat(
        choice(
          ...kws("reduced", "functionality"),
          ...kws("no", "standard", "page", "heading"),
          seq(...kws("defining", "database"), field("logical_db", $.identifier)),
          seq(kw("line-size"), field("line_size", $.number)),
          seq(
            kw("line-count"),
            field("page_lines", $.number),
            token.immediate("("),
            field("footer_lines", $._immediate_number),
            token.immediate(")")
          ),
          seq(kw("message-id"), field("message_class", $.identifier)),
        )
      ),
      "."),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPTYPES_TABCAT.html
    _table_category: $ => choice(
      kw("standard"),
      kw("sorted"),
      kw("hashed"),
      kw("any"),
      kw("index"),
    ),

    _type_clause: $ => choice(
      $.table_type,
      $.simple_type,
      $.copy_type
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPTYPES_ITAB.html
    // The source field (TYPE OF src) can either be an identifier (when LIKE) or a type (when TYPE)
    // and since TS is context free, I guess the easiest way to handle this is duplicating..
    table_type: $ => choice(
      tableType($, true),
      tableType($, false),
    ),

    simple_type: $ => seq(
      kw("type"),
      field("name", $.typename),
      repeat(
        choice(
          field("length", $._data_length),
          field("decimals", $._data_decimals),

          // FIXME This really shouldnt be part of a type reference, but unfortunately
          // the values and read-only keyword from a data declaration can be mixed into it..
          field("value", seq(
            kw("value"), choice(
              $.number,
              $.literal_string,
              seq(...kws("is", "initial")),
              $.identifier // constants
            )
          )),
          kw("read-only"),
        )
      ),
    ),

    copy_type: $ => seq(
      kw("like"),
      field("name", $.identifier),
      optional(kw("read-only"))
    ),

    _data_length: $ => seq(kw("length"), choice($.number, $.literal_string)),
    _data_decimals: $ => seq(kw("decimals"), $.number),

    typename: $ => /[a-zA-Z\/][a-zA-Z0-9_\/-]*/,
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
 * Generates a structure specification rule.
 * 
 * This is neat because there are essentially 4 ways to define structures:
 * 
 * 1. TYPES: BEGIN OF foo, [...]
 * 2. DATA BEGIN OF foo. [...]
 * 3. DATA: BEGIN OF foo, [...]
 * 4. TYPES BEGIN OF foo. [...]
 * 
 * Specifically, they differ in the way they are separated and what they declare:
 * a type or an identifier. The fields are always identifiers, even inside types.
 * 
 * @param {string} separator The seperator for each line line.
 * @param {string | undefined} keyword The keyword of the struct, either DATA, TYPES or undefined.
 * @param {Rule} identifierType The identifier type for the structure (variable or type)
 * @param {Rule} fieldRule The identifier type for the structure (variable or type)
 * 
 * @returns {Rule} A rule for the struct spec
 */
function structureSpec(separator, identifierType, keyword, fieldRule, $) {
  let componentSequence = seq(alias(fieldRule, $.component_spec), separator);
  if (keyword) {
    componentSequence.members.unshift(kw(keyword))
  }

  return seq(
    ...kws("begin", "of"),
    field("nameOpen", identifierType),
    optional(kw("read-only")),
    separator,
    // if a keyword is needed, it is an expanded (old style) declaration and must be part
    // of each line, but wont be part of the rule.
    repeat(componentSequence),
    ...(keyword ? kws(keyword, "end", "of") : kws("end", "of")),
    field("nameClose", identifierType)
  );
}

function oneOrMoreDeclarations(keyword, rule) {
  return seq(
    kw(keyword),
    // If the keyword is followed by a `:` then multiple declarations are allowed.
    choice(
      seq(":", commaSep1(rule)),
      // FIXME: In the case of new-style structure declarations, a : is actually required.
      // So the complex spec rules this leads into technically isnt entirely correct.
      rule,
    ),
    ".");
}

/**
 * @param {boolean} likeReference Whether the table source is a like reference
 */
function tableType($, likeReference) {
  return seq(
    kw(likeReference ? "like" : "type"),
    optional(field("kind", $._table_category)),
    ...kws("table", "of"),

    field("source", likeReference ? $.identifier : $.typename),

    optional(
      seq(
        ...kws("initial", "size"),
        field("initial_size", $.number)
      )
    ));
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