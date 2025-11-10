/**
 * @file Abap grammar for tree-sitter
 * @author Kendrick Hommel <kendrick.hommel@gmail.com>
 * @license MIT
 */

BUFF_SIZE = $ => seq(
  token.immediate("("),
  field("length", alias(token.immediate(/-?\d+/), $.number)),
  token.immediate(")")
);

ABAP_TYPE = /[bBcCdDfFiInNpPsStTxX]|decfloat16|decfloat34|string|utclong|xstring/i;
IDENTIFIER_REGEX = /[a-zA-Z_\/][a-zA-Z0-9_\/]*/;

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
     * Also make sure not to use a regex for the whitespace, it will have higher priority
     * and thus our external scanner, wont be called to track when a line comment is coming up.
     */
    $._ws,
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
      $.types_declaration,
      $.constants_declaration,
      $.report_initiator,
      $.class_definition,
      $.class_implementation,
      $.deferred_class_definition,
      $.local_friends_spec,
      // Not technically allowed just randomly outside of classes, but we will allow it
      // since we just want to parse a superset of the actual syntax.
      $.class_data_declaration,
    ),

    // Statements that start a block and have a body. For example method implementations,
    // class /function definitions and implementations, etc..
    _compound_statement: $ => choice(),

    _class_component: $ => choice(
      $.data_declaration,
      $.class_data_declaration,
      $.constants_declaration,
      $.types_declaration,
      $.methods_declaration
    ),

    ...generate_decl_specs({
      data: $ => $.identifier,
      class_data: $ => $.identifier,
      types: $ => $._type_identifier,
      constants: $ => alias($.identifier, $.constant),
    }),

    _type_clause: $ => choice(
      $.elementary_type,
      $.referred_type,
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
    elementary_type: $ => prec.right(choice(
      // Optional Buff size + type + optional type meta
      seq(optional(BUFF_SIZE($)), seq(kw("type"), ABAP_TYPE), repeat($._type_meta)),
      // Optional buff size + required type meta
      seq(optional(BUFF_SIZE($)), repeat1($._type_meta)),
      // Only buf size
      BUFF_SIZE($)
    )),

    /**
     * Internal Table type declaration.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDATA_ITAB.html
     */
    table_type: $ => prec.right(seq(
      typeOrLikeExpr($,
        seq(
          optional(field("kind", $._table_category)),
          ...kws("table", "of"),
        )
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
    )),

    /**
     * Range Table declaration.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDATA_RANGES.html
     */
    range_type: $ => prec.right(seq(
      typeOrLikeExpr($, seq(...kws("range", "of"))),
      repeat(choice(
        seq(...kws("initial", "size"), field("initial_size", $.number)),
        // Not technically valid for types declarations but intentionally tolerated.
        seq(...kws("value", "is", "initial")),
        seq(...kws("read-only")),
        // obsolete
        seq(...kws("with", "header", "line")),
      )
      )
    )),

    /**
     * Reference (NOT DERIVED) type to another type declared with `ref to`.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDATA_REFERENCES.html
     */
    ref_type: $ => prec.right(seq(
      typeOrLikeExpr($, seq(...kws("ref", "to"))),

      // Not technically valid for types declarations but intentionally tolerated.
      repeat(choice(
        seq(...kws("value", "is", "initial")),
        seq(...kws("read-only"))
      ))
    )),

    /**
     * Type that refers to another type (declared elsewhere or in the DDIC) or
     * taken over from a data object.
     * 
     * The additions `length` and `decimals` are forbidden in this context.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDATA_REFERRING.html
     */
    referred_type: $ => prec.right(seq(
      typeOrLikeExpr($, optional(seq(...kws("line", "of")))),
      repeat(choice(
        field("value", seq(
          kw("value"), choice(
            $.number,
            $.literal_string,
            seq(...kws("is", "initial")),
            $.identifier,
          )
        )),
        kw("read-only"))
      )
    )),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS.html
    class_definition: $ => seq(
      kw("class"), field("name", $._cls_identifier), kw("definition"),
      optional(field("options", $.class_options)), ".",

      // These actually have to appear in order, private cant come before public if public is specified.
      field("public", optional($.public_section)),
      field("protected", optional($.protected_section)),
      field("private", optional($.private_section)),

      kw("endclass"), "."
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS_IMPLEMENTATION.html
    class_implementation: $ => seq(
      kw("class"), field("name", $._cls_identifier), kw("implementation"), ".",
      kw("endclass"), "."
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS_DEFERRED.html
    deferred_class_definition: $ => seq(
      kw("class"), field("name", $._cls_identifier), ...kws("definition", "deferred"),
      "."
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS_LOCAL_FRIENDS.html
    local_friends_spec: $ => seq(
      kw("class"),
      field("name", $._cls_identifier),
      ...kws("definition", "local", "friends"),
      repeat1($._cls_identifier),
      "."
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS_OPTIONS.html
    class_options: $ => seq(
      // can appear in any order
      repeat1(
        choice(
          kw("public"),
          // classes can only inherit from 0 to 1 superclasses.
          seq(...kws("inheriting", "from"), field("parent", $._cls_identifier)),
          kw("abstract"),
          kw("final"),
          seq(kw("create"), field("create_visibility", $._visibility)),
          field("testing", $.for_testing_spec),
          seq(...kws("shared", "memory", "enabled")),
          seq(...kws("for", "behavior", "of"), field("behavior_ref", $._type_identifier)),
        )
      ),
      // friends must be specified at the end of the statement.
      optional($.global_friends),
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS_FOR_TESTING.html
    for_testing_spec: $ => seq(
      ...kws("for", "testing"),
      repeat(
        choice(
          seq(...kws("risk", "level"), field("risk_level", $._test_risk_level)),
          seq(kw("duration"), field("duration", $._test_duration)),
        )
      )
    ),

    global_friends: $ => seq(
      optional(kw("global")),
      kw("friends"),
      repeat1($._cls_identifier)
    ),

    public_section: $ => seq(
      ...kws("public", "section"), ".",
      repeat($._class_component)
    ),

    protected_section: $ => seq(
      ...kws("protected", "section"), ".",
      repeat($._class_component)
    ),

    private_section: $ => seq(
      ...kws("private", "section"), ".",
      repeat($._class_component)
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHODS.html
    methods_declaration: $ => seq(
      kw("methods"),
      choice(
        seq(":", commaSep1($._method_spec)),
        $._method_spec
      ),
      "."
    ),

    _method_spec: $ => choice(
      $.method_spec,
      $.method_redefinition,
      $.event_handler
      //TODO: AMDP, Test
    ),

    /**
     * Technically methods split into general and functional methods.
     * 
     * The distinction is that general methods cannot have a `returning` addition and retain
     * their sy-subrc from their `exceptions`.
     * 
     * However, its simpler to just parse them as one.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHODS_GENERAL.html
     */
    method_spec: $ => seq(
      field("name", $.identifier),
      optional(choice(...kws("abstract", "final"))),
      optional($.intf_method_default),
      // can appear in any order
      repeat(
        choice(
          params("importing", $.parameter_list),
          params("exporting", $.parameter_list),
          params("changing", $.parameter_list),
          params("raising", $.raising_list),
          params("exceptions", $.exception_list),
          params("returning", $.return_value),
        )
      )
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHODS_EVENT_HANDLER.html
    event_handler: $ => seq(
      field("name", $.identifier),
      optional(choice(...kws("abstract", "final"))),
      optional($.intf_method_default),
      ...kws("for", "event"),
      field("event", $.identifier),
      kw("of"),
      field("source", $.identifier),
      optional(
        params("importing", $.parameter_list),
      )
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHODS_CONSTRUCTOR.html
    constructor: $ => seq(
      kw("constructor"),
      optional(kw("final")),
      // can appear in any order
      repeat(
        choice(
          params("importing", $.parameter_list),
          params("raising", $.raising_list),
          params("exceptions", $.exception_list),
        )
      )
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHODS_REDEFINITION.html
    method_redefinition: $ => seq(
      field("name", $.identifier),
      optional(kw("final")),
      kw("redefinition"),
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHODS_DEFAULT.html
    intf_method_default: $ => seq(
      kw("default"),
      field("default", choice(...kws("ignore", "fail")))
    ),

    parameter_list: $ => seq(
      repeat1($.parameter),
      optional($.preferred_parameter)
    ),

    preferred_parameter: $ => seq(
      ...kws("preferred", "parameter"),
      field("name", $.identifier)
    ),

    raising_list: $ => repeat1($.exception),
    exception_list: $ => repeat1($.identifier),
    return_value: $ => seq(
      kw("returning"), $.parameter
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHODS_PARAMETERS.html
    parameter: $ => prec.right(seq(
      // The addition `value` and `reference` is optional (reference is default)
      choice(
        field("name", $.identifier),
        seq(
          choice(...kws("value", "reference")),
          token.immediate("("),
          field("name", $._immediate_identifier),
          token.immediate(")")
        ),
      ),
      field("typing", optional($._type_clause)),
      // Technically only allowed for importing parameters
      optional(choice(
        kw("optional"),
        seq(
          kw("default"),
          choice(
            $.identifier, // constant
            $.number,
            $.literal_string
          )
        )
      ))
    )),

    exception: $ => choice(
      field("name", $._cls_identifier),
      seq(
        kw("resumable"),
        token.immediate("("),
        field("name", $._cls_identifier),
        token.immediate(")"),
      )
    ),

    _visibility: _ => choice(...kws("public", "protected", "private")),
    _test_risk_level: _ => choice(...kws("critical", "dangerous", "harmless")),
    _test_duration: _ => choice(...kws("short", "medium", "long")),

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

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPTYPES_PRIMARY_KEY.html
    table_key_spec: $ => prec.right(seq(
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
    )),

    /**
     * INCLUDE {TYPE | STRUCTURE} inside struct declaration (BEGIN OF...).
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPINCLUDE_TYPE.html
     */
    struct_include: $ => seq(
      kw("include"),
      field("name", choice(
        seq(kw("type"), $._type_identifier),
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

    /** 
     * Static access to a member of a class using `cls=>member`.
     * 
     * Must be followed by immediate accesses.
     */
    _static_field_access: $ => seq(
      field("source", $._cls_identifier),
      token.immediate("=>"),
      field("member", choice(
        $._immediate_identifier,
        alias($._immediate_instance_field_access, $.instance_access),
        alias($._immediate_component_field_access, $.component_access)
      ))
    ),

    /**
     * Instance access to a class member using `instance->member`.
     * 
     * Must be followed by immediate accesses.
     */
    _instance_field_access: $ => seq(
      field("source", $.identifier),
      token.immediate("->"),
      field("member", choice(
        $._immediate_identifier,
        alias($._immediate_instance_field_access, $.instance_access),
        alias($._immediate_component_field_access, $.component_access)
      ))
    ),

    /** 
     * Static access to a type member of a class using `cls=>type`.
     * 
     * Must be followed by immediate accesses.
     */
    _static_type_access: $ => seq(
      field("source", $._cls_identifier),
      token.immediate("=>"),
      field("member", choice(
        $._immediate_type_identifier,
        alias($._immediate_instance_type_access, $.instance_access),
      ))
    ),

    /**
     * Instance access to a class type member using `instance->type`
     * 
     * Must be followed by immediate accesses.
     */
    _instance_type_access: $ => seq(
      field("source", $.identifier),
      token.immediate("->"),
      field("member", choice(
        $._immediate_type_identifier,
        alias($._immediate_instance_type_access, $._instance_type_access),
      ))
    ),

    _immediate_instance_field_access: $ => seq(
      field("source", $._immediate_identifier),
      token.immediate("->"),
      field("member", choice(
        $._immediate_identifier,
        alias($._immediate_component_field_access, $.component_access),
        alias($._immediate_instance_field_access, $._instance_field_access)
      ))
    ),

    _immediate_instance_type_access: $ => seq(
      field("source", $._immediate_identifier),
      token.immediate("->"),
      field("member", choice(
        $._immediate_type_identifier,
        alias($._immediate_instance_type_access, $._instance_type_access)
      ))
    ),

    _component_field_access: $ => componentAccess($, $.identifier),
    _component_type_access: $ => componentAccess($, $._type_identifier),

    /**
     * Immediate component type access isnt possible because components cant have types.
     * 
     * Even a statement like `... type component-field->type` is invalid where field is a class reference.
     */
    _immediate_component_field_access: $ => componentAccess($, $._immediate_identifier),


    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPTYPES_TABCAT.html
    _table_category: _ => choice(
      kw("standard"),
      kw("sorted"),
      kw("hashed"),
      kw("any"),
      kw("index"),
    ),


    /**
     * One of the possible specifications alongside a specification.
     * 
     * In reality, not all fields are possible in any context. For example, the `value`
     * addition cannot be used for `types` declarations, but MUST be used for `constants`.
     * 
     * However, to keep things simple and provide better error messages, its far simpler to
     * just parse it as valid grammar and then match invalid combinations in queries.
     */
    _type_meta: $ => choice(
      field("length", $._data_length),
      field("decimals", $._data_decimals),
      field("value", seq(
        kw("value"), choice(
          $.number,
          $.literal_string,
          seq(...kws("is", "initial")),
          $.identifier,
        )
      )),
      field("readonly", kw("read-only"))
    ),

    _data_length: $ => seq(kw("length"), choice($.number, $.literal_string)),
    _data_decimals: $ => seq(kw("decimals"), $.number),

    identifier: _ => IDENTIFIER_REGEX,
    _type_identifier: $ => alias($.identifier, $.type_identifier),
    _cls_identifier: $ => alias($.identifier, $.cls_identifier),

    field_symbol: $ => /[a-zA-Z][a-zA-Z0-9_\/-<>]*/,

    _immediate_identifier: $ => alias(token.immediate(IDENTIFIER_REGEX), $.identifier),
    _immediate_type_identifier: $ => alias(token.immediate(IDENTIFIER_REGEX), $.type_identifier),
    _immediate_number: $ => alias(token.immediate(/-?\d+/), $.number),

    number: $ => /-?\d+/,
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

    _ws: _ => /\s/,

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
 * @param {string | undefined} keyword The keyword of the struct, either DATA, TYPES or undefined.
 * @param {Rule} identifierNode The identifier type for the structure
 * @param {Rule} componentRule The identifier type for components of the structure
 */
function structureSpec($, keyword, identifierNode, componentRule) {
  // If a keyword is present, the separator MUST be a `.`
  let separator = keyword ? '.' : ',';

  let compRule = seq(alias(componentRule, $.component_spec), separator);
  let endRule = seq(...kws("end", "of"));
  if (separator == '.') {
    compRule.members.unshift(kw(keyword), optional(":"))
    endRule.members.unshift(kw(keyword), optional(":"));
  }

  return seq(
    ...kws("begin", "of"), field("nameOpen", identifierNode),
    optional(kw("read-only")),
    separator,
    // Technically at least one field is required, but this is another one
    // of those situations where it makes more sense to just let it parse
    // and pre process the problem.
    repeat(
      choice(
        compRule,
        seq($.struct_include, separator)
      )
    ),
    endRule, field("nameClose", identifierNode)
  );
}

/**
 * Generates declarations and data specs for the given declaration kinds.
 * 
 * There are many different ways to declare, e.g `data`, `types`, `constants`,
 * `class-data`, `statics`.. which are all fundamentally the same and only differ
 * in the preceding keyword and the type of nodes they eventually yield.
 * 
 * This generates the declaration and specification trees for each of the given
 * declaration options to be unpacked into the grammar rules.
 * 
 * @param {Record<string, ($) => Rule>} decl_map A map of declaration keywords to their node type.
 * 
 * @returns A set of rules to be unpacked into the grammar.
 */
function generate_decl_specs(decl_map) {
  rules = {}

  function decl(keyword) {
    const spec = `${keyword}_spec`;

    rules[`${keyword}_declaration`] = $ => seq(
      kw(keyword.replace("_", "-")),
      choice(
        seq(":", commaSep1($[spec])),
        $[spec]
      ),
      ".");
  }

  function spec(keyword, identifierNode) {
    const name = `${keyword}_spec`;
    const comp = `_${keyword}_comp_spec`;

    keyword = keyword.replace("_", "-")

    /**
     * Regardless of whether a struct is declared using CONSTANTS, TYPES, etc.
     * the components (fields) that make up the structure should always be
     * identifier nodes, not const and much less type nodes.
     * 
     * Because the keyword at the start of each line still needs to be taken into
     * consideration, such a helper rule is necessary.
     */
    rules[comp] = $ => choice(
      seq(
        field("name", $.identifier),
        optional(field("type", $._type_clause))
      ),

      structureSpec($, undefined, $.identifier, $[comp]),
      structureSpec($, keyword, $.identifier, $[comp]),
    );

    rules[name] = $ => choice(
      seq(
        field("name", identifierNode($)),
        optional(field("type", $._type_clause))
      ),

      /**
       * This technically isnt completely legal since it allows sub structure specs preceded by a DATA
       * keyword inside a `data:` block, but it is such a nice scenario worth keeping the grammar simpler over.
       * 
       * It is however quite important to generate two absolute paths here, because we at least dont want to allow
       * the old-style struct declaration to be completed mixed into new-style declarations, i.e when the
       * declaration block starts with DATA [...]., it shouldnt be allowed to have a component inside the
       * block that does NOT start with DATA.
       * */
      structureSpec($, undefined, identifierNode($), $[comp]),
      structureSpec($, keyword, identifierNode($), $[comp]),
    );
  }

  for (const [keyword, node] of Object.entries(decl_map)) {
    decl(keyword);
    spec(keyword, node);
  }
  return rules;
}

/**
 * Branches into a `type <addition> ... <type>` or `like <addition> <dobj>`.
 * 
 * Do not use this rule if you require the distinction between type and dobj
 * beyond reaching the `type` clause.
 * 
 * @param {Rule} addition The addition to inject between the keywords.
 */
function typeOrLikeExpr($, addition) {
  return choice(
    seq(
      kw("type"),
      addition,
      field("type", choice(
        $._type_identifier,
        alias($._static_type_access, $.static_access),
        alias($._instance_type_access, $.instance_access),
        alias($._component_type_access, $.component_access),
      ))
    ),
    seq(
      kw("like"),
      addition,
      field("dobj", choice(
        $.identifier,
        alias($._static_field_access, $.static_access),
        alias($._instance_field_access, $.instance_access),
        alias($._component_field_access, $.component_access),
      ))
    ),
  );
}

/**
 * Template function for component access to determine the source identifier kind.
 */
function componentAccess($, src) {
  return seq(
    field("source", src),
    token.immediate("-"),
    field("component", choice(
      // Doesnt matter what the source of the component is, the fields are always idents
      $._immediate_identifier,
      // Could be a nested field access, but will always be an identifier and immediate.
      // The exception here could be a field of a component that is a reference to a class
      // which could then technically point to a field again.
      alias($._immediate_component_field_access, $.component_access)
    ))
  );
}


function params(keyword, rule) {
  return field(keyword, seq(kw(keyword), rule));
}