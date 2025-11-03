/**
 * @file Abap grammar for tree-sitter
 * @author Kendrick Hommel <kendrick.hommel@gmail.com>
 * @license MIT
 */

ABAP_TYPE = /[bBcCdDfFiInNpPsStTxX]|decfloat16|decfloat34|string|utclong|xstring/i;
BUFF_SIZE = $ => seq(
  token.immediate("("),
  field("length", alias(token.immediate(/-?\d+/), $.number)),
  token.immediate(")")
);

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
      $.const_declaration,
      $.report_initiator
    ),

    // Statements that start a block and have a body. For example method implementations,
    // class /function definitions and implementations, etc..
    _compound_statement: $ => choice(),

    data_declaration: $ => decl("data", $._data_multi_spec, $._data_single_spec, $.data_spec),
    type_declaration: $ => decl("types", $._type_multi_spec, $._type_single_spec, $.type_spec),
    const_declaration: $ => decl("constants", $._const_multi_spec, $._const_single_spec, $.const_spec),

    _data_multi_spec: $ => choice(
      seq(
        field("name", $.identifier),
        optional(field("type", $._type_clause))
      ),
      structureSpec(",", $.identifier, undefined, $._data_multi_spec, $),
      structureSpec(".", $.identifier, "data", $._data_single_spec, $)
    ),

    _data_single_spec: $ => choice(
      seq(
        field("name", $.identifier),
        optional(field("type", $._type_clause))
      ),
      structureSpec(".", $.identifier, "data", $._data_single_spec, $)
    ),

    // FIXME: Using data single spec will lead to expecting DATA on old style
    _type_multi_spec: $ => choice(
      seq(
        field("name", $.typename),
        optional(field("type", $._type_clause))
      ),
      structureSpec(",", $.typename, undefined, $._data_multi_spec, $),
      structureSpec(".", $.typename, "types", $._data_single_spec, $)
    ),

    // FIXME: Using data single spec will lead to expecting DATA on old style, but using a type single
    // spec will make the node a typename :/
    _type_single_spec: $ => choice(
      seq(
        field("name", $.typename),
        optional(field("type", $._type_clause))
      ),
      structureSpec(".", $.typename, "data", $._data_single_spec, $)
    ),

    // FIXME: Using data single spec will lead to expecting DATA on old style
    _const_multi_spec: $ => choice(
      seq(
        field("name", alias($.identifier, $.constant)),
        optional(field("type", $._type_clause))
      ),
      structureSpec(",", alias($.identifier, $.constant), undefined, $._data_multi_spec, $),
      structureSpec(".", alias($.identifier, $.constant), "constants", $._data_single_spec, $)
    ),

    // FIXME: Using data single spec will lead to expecting DATA on old style, but using a type single
    // spec will make the node a typename :/
    _const_single_spec: $ => choice(
      seq(
        field("name", alias($.identifier, $.constant)),
        optional(field("type", $._type_clause))
      ),
      structureSpec(".", alias($.identifier, $.constant), "constants", $._data_single_spec, $)
    ),

    _type_clause: $ => choice(
      $.elementary_type,
      $.derived_type,
      $.ref_type,
      $.table_type,
      $.range_type,
    ),

    /**
     * Type based on elementary types. Only here are `length` and `decimals` additions allowed.
     * 
     * While part of this statement is optional, tree sitter doesnt allow empty rules,
     * so we kind of have to list possible combinations (in order).
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDATA_SIMPLE.html
     */
    elementary_type: $ => choice(
      // Optional Buff size + type + optional type meta
      seq(optional(BUFF_SIZE($)), seq(kw("type"), ABAP_TYPE), typeMeta($, { isElementary: true })),
      // Optional buff size + required type meta
      seq(optional(BUFF_SIZE($)), typeMeta($, { isElementary: true, require: true })),
      // Only buf size
      BUFF_SIZE($)
    ),

    /**
     * Internal Table type declaration.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDATA_ITAB.html
     */
    table_type: $ => seq(
      choice(
        seq(
          kw("like"),
          optional(field("kind", $._table_category)),
          ...kws("table", "of"),
          field("dobj", $.identifier),
        ),
        seq(
          kw("type"),
          optional(field("kind", $._table_category)),
          ...kws("table", "of"),
          field("type", $.typename),
        ),
      ),
      repeat($.table_key_spec),
      repeat(choice(
        seq(
          ...kws("initial", "size"),
          field("initial_size", $.number)
        ),
        // Not technically valid for types declarations but intentionally tolerated.
        seq(...kws("value", "is", "initial")),
        seq(...kws("read-only")),
        // obsolete
        seq(...kws("with", "header", "line")),
      ))
    ),

    /**
     * Range Table declaration.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDATA_RANGES.html
     */
    range_type: $ => seq(
      choice(
        seq(
          kw("type"),
          seq(...kws("range", "of")),
          field("type", $.typename)
        ),
        seq(
          kw("like"),
          seq(...kws("range", "of")),
          field("dobj", $.identifier)
        ),
      ),
      repeat(choice(
        seq(...kws("initial", "size"), field("initial_size", $.number)),
        // Not technically valid for types declarations but intentionally tolerated.
        seq(...kws("value", "is", "initial")),
        seq(...kws("read-only")),
        // obsolete
        seq(...kws("with", "header", "line")),
      )
      )
    ),

    /**
     * Reference (NOT DERIVED) type to another type declared with `ref to`.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDATA_REFERENCES.html
     */
    ref_type: $ => seq(
      choice(
        seq(
          kw("type"),
          seq(...kws("ref", "to")),
          field("type", $.typename)
        ),
        seq(
          kw("like"),
          seq(...kws("ref", "to")),
          field("dobj", $.identifier)
        ),
      ),
      // Not technically valid for types declarations but intentionally tolerated.
      repeat(choice(
        seq(...kws("value", "is", "initial")),
        seq(...kws("read-only"))
      ))
    ),

    /**
     * Type that is derived from another type (declared elsewhere or in the DDIC) or
     * taken over from a data object.
     * 
     * The additions `length` and `decimals` are forbidden in this context.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDATA_REFERRING.html
     */
    derived_type: $ => seq(
      choice(
        seq(
          kw("type"),
          optional(seq(...kws("line", "of"))),
          field("type", $.typename)
        ),
        seq(
          kw("like"),
          optional(seq(...kws("line", "of"))),
          field("dobj", $.identifier)
        ),
      ),
      repeat(choice(
        field("value", seq(
          kw("value"), choice(
            $.number,
            $.literal_string,
            seq(...kws("is", "initial")),
            $.identifier
          )
        )),
        kw("read-only"))
      )
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

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPTYPES_PRIMARY_KEY.html
    table_key_spec: $ => seq(
      kw("with"),

      choice(
        // empty and default key, nothing more to specify.
        seq(...kws("default", "key")),
        seq(...kws("empty", "key")),
        seq(
          // can be defined in any order or not at all
          repeat(
            choice(
              kw("unique"),
              kw("non-unique"),
              kw("sorted"),
              kw("hashed")
            )
          ),
          kw("key"),
          choice(
            // either implicit primary key listing..
            repeat1(alias($.identifier, $.table_component)),
            // .. or an explicit key definition
            seq(
              field("name", alias($.identifier, $.table_key)),
              optional(seq(kw("alias"), field("alias", $.identifier))),
              kw("components"),
              repeat1(alias($.identifier, $.table_component)),
            ),
          ))
      ),
    ),

    /**
     * INCLUDE {TYPE | STRUCTURE} inside struct declaration (BEGIN OF...).
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPINCLUDE_TYPE.html
     */
    struct_include: $ => seq(
      kw("include"),
      field("name", choice(
        seq(kw("type"), $.typename),
        seq(kw("structure"), $.identifier),
      )),
      optional(
        seq(kw("as"), field("alias", $.identifier)),
      ),
      optional(
        seq(
          ...kws("renaming", "with", "suffix"),
          field("suffix", $.identifier)
        )
      ),
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

function commaOrDotSep1(rule) {
  return seq(rule, repeat(seq(choice(',', '.'), rule)))
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
    // Using e.g data: on each line is also legal.
    if (separator == '.') {
      componentSequence.members.unshift(optional(token(":")))
    }
    componentSequence.members.unshift(kw(keyword));
  }

  let endOf;
  if (keyword) {
    endOf = seq(kw(keyword), optional(":"), ...kws("end", "of"))
  } else {
    endOf = seq(...kws("end", "of"));
  }

  return seq(
    ...kws("begin", "of"),
    field("nameOpen", identifierType),
    optional(kw("read-only")),
    separator,
    // Technically at least one field is required, but this is another one
    // of those situations where it makes more sense to just let it parse
    // and pre process the problem.
    repeat(
      choice(
        componentSequence,
        seq($.struct_include, separator)
      )
    ),
    endOf,
    field("nameClose", identifierType)
  );
}
/**
 * 
 * @param {string} keyword The keyword beginning the declaration
 * @param {GrammarSymbol} multi_spec The rule to match any possible declaration specification
 * @param {GrammarSymbol} single_spec The rule to match a single possible declaration.
 * @param {GrammarSymbol} spec_alias The node alias to wrap both the spec rules in.
 * 
 * @returns {Record<string, Rule>} a map of rules to unpack
 */
function decl(keyword, multi_spec, single_spec, spec_alias) {
  return seq(
    kw(keyword),
    choice(
      seq(":", commaSep1(alias(multi_spec, spec_alias))),
      alias(single_spec, spec_alias),
    ),
    ".");
}

/**
 * @param {boolean} isElementary whether the type is an elementary data type.
 * @param {boolean} isData whether its a data definition, so value and read-only are allowed.
 * 
 * @returns {Rule} A rule to match the type meta.
 */
function typeMeta($, { isElementary = false, require = false } = {}) {
  let choices = choice();
  if (isElementary) {
    choices.members.push(field("length", $._data_length));
    choices.members.push(field("decimals", $._data_decimals));
  }
  choices.members.push(
    field("value", seq(
      kw("value"), choice(
        $.number,
        $.literal_string,
        seq(...kws("is", "initial")),
        $.identifier
      )
    ))
  );
  choices.members.push(kw("read-only"));
  if (require) {
    return repeat1(choices)
  }
  return repeat(choices);
}



