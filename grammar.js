/**
 * @file Abap grammar for tree-sitter
 * @author Kendrick Hommel <kendrick.hommel@gmail.com>
 * @license MIT
 */

ABAP_TYPE = /[bBcCdDfFiInNpPsStTxX]|decfloat16|decfloat34|string|utclong|xstring/i;

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

    data_declaration: $ => oneOrMoreDeclarations("data", $.data_spec),

    type_declaration: $ => oneOrMoreDeclarations("types", $.type_spec),

    // FIXME: For constants, the `value` part of the declaration is not optional.
    const_declaration: $ => oneOrMoreDeclarations("constants", alias($.data_spec, $.const_spec)),

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
      optional(field("type", choice(
        $.simple_data_type,
        $.itab_data_type,
        // $.derived_data_type,
        $.ref_data_type,
        $.range_data_type,
      ))),
    ),

    _simple_type_spec: $ => seq(
      field("name", $.typename),
      optional(field("type", choice(
        $.simple_types_type,
        $.itab_types_type,
        $.derived_types_type,
        $.ref_types_type,
        $.range_types_type,
      ))),
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

    /**
     * Elementary types (abap_types)
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENBUILTIN_ABAP_TYPE_GLOSRY.html
     */
    _abap_type: _ => token(
      /[bBcCdDfFiInNpPsStTxX]|decfloat16|decfloat34|string|utclong|xstring/i
    ),

    ...defineTypePairs({
      simple: simpleTypeClause,
      itab: itabTypeClause,
      derived: derivedTypeClause,
      ref: refTypeClause,
      range: rangeTypeClause,
    }),
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
    repeat(
      choice(
        componentSequence,
        seq($.struct_include, separator)
      )
    ),
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
 * @param {boolean} isElementary whether the type is an elementary data type.
 * @param {boolean} isData whether its a data definition, so value and read-only are allowed.
 * 
 * @returns {Rule} A rule to match the type meta.
 */
function typeMeta($, { isElementary = false, isData = true, require = false } = {}) {
  let choices = choice();
  if (isElementary) {
    choices.members.push(field("length", $._data_length));
    choices.members.push(field("decimals", $._data_decimals));
  }
  if (isData) {
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
  }
  if (require) {
    return repeat1(choices)
  }
  return repeat(choices);
}
/**
 * Type based on elementary types. Only here are `length` and `decimals` additions allowed.
 * 
 * This clause is largely the same for data and types declarations with the only difference
 * being that, when applied to a `data` declaration, its allowed to specify `value` and `read-only`.
 * 
 * Since they can literally be mixed into the relevant `type` specifications, theres no other way
 * than to duplicate the logic to handle both individually.
 * 
 * While part of this statement is optional, tree sitter doesnt allow empty rules,
 * so we kind of have to list possible combinations (in order).
 * 
 * @param {boolean} isData Whether the type clause applies to a `data` or `types` spec.
 * 
 * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDATA_SIMPLE.html
 */
function simpleTypeClause($, { isData = false }) {
  const elementaryType = seq(
    kw("type"),
    field("name", alias(ABAP_TYPE, $.typename))
  );

  const bufferSize = seq(
    token.immediate("("),
    field("length", alias(token.immediate(/-?\d+/), $.number)),
    token.immediate(")")
  );

  return choice(
    // Optional Buff size + type + optional type meta
    seq(optional(bufferSize), elementaryType, typeMeta($, { isElementary: true, isData })),
    // Optional buff size + required type meta
    seq(optional(bufferSize), typeMeta($, { isElementary: true, isData, require: true })),
    // Only buf size
    bufferSize
  );
}

/**
 * Internal Table type declaration.
 * 
 * When derived, the source type is an identifier, otherwise a typename.
 * The additions `read-only` and `value is initial` are onl allowed on
 * data specifications.
 * 
 * @param {boolean} isData Whether the table clause applies to a `data` spec.
 * 
 * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDATA_ITAB.html
 */
function itabTypeClause($, { isData = false }) {
  let metaChoices = choice(
    seq(
      ...kws("initial", "size"),
      field("initial_size", $.number)
    ),
    // obsolete
    seq(...kws("with", "header", "line")),
  );

  if (isData) {
    metaChoices.members.push(seq(...kws("value", "is", "initial")));
    metaChoices.members.push(seq(...kws("read-only")));
  }

  return seq(
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
    repeat(metaChoices)
  );
}

/**
 * Type that is derived from another type (declared elsewhere or in the DDIC) or
 * taken over from a data object.
 * 
 * The additions `length` and `decimals` are forbidden in this context.
 * 
 * Because the type or dobj must appear directly after either `like` or `type`, 
 * it is trivial to find the correct sequence here and same the rule can be used for both.
 * 
 * @param {boolean} isData Whether the clause applies to a `data` spec.
 * 
 * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDATA_REFERRING.html
 */
function derivedTypeClause($, { isData = false }) {
  return seq(
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
    typeMeta($, { isElementary: false, isData })
  )
}

/**
 * Reference (NOT DERIVED) type to another type declared with `ref to`.
 * 
 * Because the type or dobj must appear directly after either `like` or `type`, 
 * it is trivial to find the correct sequence here and same the rule can be used for both.
 * 
 * For the `value` addition, only `is initial` is valid in this context.
 * 
 * @param {boolean} isData Whether the clause applies to a `data` spec.
 * 
 * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDATA_REFERENCES.html
 */
function refTypeClause($, { isData = false }) {
  let metaChoices = choice();
  if (isData) {
    metaChoices.members.push(seq(...kws("value", "is", "initial")));
    metaChoices.members.push(seq(...kws("read-only")));
  }

  return seq(
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
    repeat(metaChoices)
  );
}

/**
 * Range Table declaration.
 * 
 * For data specifications, the `value` addition can only take on `is initial.
 * 
 * @param {boolean} isData Whether the clause applies to a `data` spec.
 */
function rangeTypeClause($, { isData = false }) {
  let metaChoices = choice(
    seq(...kws("initial", "size"), field("initial_size", $.number)),
    // obsolete
    seq(...kws("with", "header", "line")),
  );

  if (isData) {
    metaChoices.members.push(seq(...kws("value", "is", "initial")));
    metaChoices.members.push(seq(...kws("read-only")));
  }

  return seq(
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
    repeat(metaChoices)
  );
}

function defineTypePairs(clauses) {
  const rules = {};

  for (const [name, clauseFn] of Object.entries(clauses)) {
    const dataRule = `${name}_data_type`;
    const typesRule = `${name}_types_type`;

    rules[dataRule] = $ => clauseFn($, { isData: true });
    rules[typesRule] = $ => clauseFn($, { isData: false });

    console.log("Added ", dataRule);

  }
  console.log(rules);

  return rules;
}