/**
 * @file Abap grammar for tree-sitter
 * @author Kendrick Hommel <kendrick.hommel@gmail.com>
 * @license MIT
 */

// Cant be a rule due to priority, need to figure how to handle this better..
BUFF_SIZE = $ => seq(
  token.immediate("("),
  field("length", alias(token.immediate(NUMBER_REGEX), $.number)),
  token.immediate(")")
);

const ABAP_TYPE = /[bBcCdDfFiInNpPsStTxX]|decfloat16|decfloat34|string|utclong|xstring/i;
const IDENTIFIER_REGEX = /<?[a-zA-Z_\/][a-zA-Z\d_/]*>?/;

// Allow a single plus or minus before the number literal
const NUMBER_REGEX = /(\+|-)?\d+/;

/**
 * Arithmetic: https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENARITH_OPERATORS.html
 */
const PREC = {
  plus: 1,
  minus: 1,
  times: 2,
  division: 2,
  floor_div: 2,
  modulo: 2,
  power: 3,
  unary: 4,
  parenthesized_expression: 5,
};

/// <reference types="tree-sitter-cli/dsl" />
// @ts-nocheck
module.exports = grammar({
  name: "abap",

  externals: $ => [
    // A single full-line comment. External scanner is due to column check.
    $.line_comment,

    // Repeated full-line comments without a gap.
    $.multi_line_comment,

    /**
     * One or more lines beginning with `"!" without a gap.
     * 
     * FIXME: ABAPDoc is something we will want to parse sooner or later, since
     * they can contain references, links etc. to other objects.
     * That cant really be done in the external scanner, so it must be a rule, 
     * meaning it also cant be in extras and must be explicitly checked.
     */
    $.docstring,

    /**
     * Message type can be the prefix of a message number, and this conflicts
     * with the word rule. There might be a better way to work around this, but
     * I could not find one.
     */
    $.message_type,

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
    $.line_comment,
    $.inline_comment,
    $.pseudo_comment,
    $.pragma,
    $.multi_line_comment,
    $.docstring,
  ],

  supertypes: $ => [
    // I'll worry about which nodes should be hidden vs supertypes later
    // once I get to working out the querying. It doesnt matter for tests.
    $.constructor_expression,
    $.iteration_expression,
    $.general_expression,
    $.writable_expression,
    $.arithmetic_expression,
    $.string_expression,
    $.itab_line,
    $.itab_comp,
    $.numeric_expression,
    $.data_component_selector,
    $.relational_expression,
    $.data_object,
    $._simple_statement,
    $._compound_statement,
    $.pattern,
    $.replace
  ],

  word: $ => $.identifier,

  rules: {
    source: $ => repeat($._statement),

    _statement: $ => choice(
      $._simple_statement,
      $._compound_statement,
      $.general_expression
    ),

    // Statements that dont have a body.
    _simple_statement: $ => choice(
      $.data_declaration,
      $.types_declaration,
      $.constants_declaration,

      $.assignment,

      $.report_initiator,
      $.deferred_class_definition,
      $.deferred_interface_definition,
      $.local_friends_spec,

      // Not technically legal but tolerated due to permissive philosophy:
      $.class_data_declaration,

      $.concatenate,
      $.condense,
      $.replace,
      $.find,
      $.split,

      $._empty_statement,
    ),

    // Statements that have a body. As a rule of thumb, that at least encompasses any kind of
    // statement that needs to be terminated with `END[...]` such as `ENDWHILE`, `ENDMETHOD`..
    _compound_statement: $ => choice(
      $.class_definition,
      $.class_implementation,
      $.interface_definition,
      $.interface_implementation,
      $.method_implementation
    ),

    _class_component: $ => choice(
      $.data_declaration,
      $.class_data_declaration,
      $.constants_declaration,
      $.types_declaration,
      $.alias_declaration,
      $.interfaces_declaration,
      $.methods_declaration,
      $.cls_methods_declaration,
      $._empty_statement,
    ),

    ...generate_decl_specs({
      data: $ => $.identifier,
      class_data: $ => $.identifier,
      types: $ => $.identifier,
      constants: $ => $.identifier
    }),

    _typing: $ => choice(
      $.elementary_type,
      $.referred_type,
      $.ref_type,
      $.table_type,
      $.range_type,
    ),

    /**
     * A builtin (keyword) expression resulting in the creation of a certain value. 
     * 
     * For example `NEW`, `VALUE`, `COND`, etc.. Refer to the link for more examples.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONSTRUCTOR_OPERATOR_GLOSRY.html 
     */
    constructor_expression: $ => choice(
      $.cond_expression,
      $.switch_expression,
      $.new_expression,
      $.value_expression,
    ),

    /**
     * https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENDATA_OBJECTS.html
     * 
     * Named data objects vs anonymous?
     */
    data_object: $ => choice(
      $.identifier,
      $.number,
      $.literal_string,
      $.data_component_selector,
    ),

    // https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENGENERAL_EXPR_POSITION_GLOSRY.html
    general_expression: $ => choice(
      $.data_object,
      $.constructor_expression,
      $.builtin_function_call,
      $.method_call,
      $.table_expression,
      $.arithmetic_expression,
      $.string_expression
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENNUMERICAL_EXPRESSION_GLOSRY.html
    numeric_expression: $ => choice(
      $.data_object,
      $.constructor_expression,
      $.builtin_function_call,
      $.method_call,
      $.table_expression,
      $.arithmetic_expression
    ),

    /**
     * A LHS operand that can be written to, can be specified in **write positions**.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENWRITABLE_EXPRESSION_GLOSRY.html
     */
    writable_expression: $ => choice(
      $.table_expression,
    ),

    /**
     * https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENLOGEXP.html
     */
    logical_expression: $ => prec(10, choice(
      $.relational_expression,
      seq('(', $.logical_expression, ')'),
      prec.right(4, seq(kw('not'), $.logical_expression)),

      prec.left(3, seq(
        $.logical_expression,
        kw('and'),
        $.logical_expression
      )),
      prec.left(2, seq(
        $.logical_expression,
        kw('or'),
        $.logical_expression
      )),
      prec.left(1, seq(
        $.logical_expression,
        kw('equiv'),
        $.logical_expression
      ))
    )),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCOMPUTE_ARITH.html
    arithmetic_expression: $ => choice(
      $.binary_operator,
      $.unary_operator,
      $.parenthesized_expression
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abapcompute_string.html
    string_expression: $ => choice(
      $.string_template,
      $.string_operator
    ),

    // https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENRELATIONAL_EXPRESSION_GLOSRY.html
    relational_expression: $ => choice(
      $.comparison_expression,
      $.predicate_expression
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENARITH_OPERATORS.html
    binary_operator: $ => {
      const table = [
        [prec.left, '+', PREC.plus],
        [prec.left, '-', PREC.plus],
        [prec.left, '*', PREC.times],
        [prec.left, '/', PREC.times],
        [prec.left, kw("div"), PREC.times],
        [prec.left, kw("mod"), PREC.times],
        [prec.right, '**', PREC.power],
      ];

      return choice(...table.map(([fn, op, prec]) => fn(prec, seq(
        field('left', $.general_expression),
        field('operator', op),
        field('right', $.general_expression),
      ))));
    },

    unary_operator: $ => prec(PREC.unary, seq(
      field("operator", choice("+", "-")),
      field("value", $.general_expression)
    )),

    /**
     * In ABAP, parentheses cant just arbitrarly be added anywhere like in most modern languages.
     * They can, however, be used in arithmetic expressions to control precendence.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENARITH_BRACKETS.html
     */
    parenthesized_expression: $ => prec(PREC.parenthesized_expression, seq(
      '(',
      choice($.arithmetic_expression),
      ')',
    )),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENSTRING_OPERATORS.html
    string_operator: $ => prec.left(seq(
      field("left", $.general_expression),
      field("operator", "&&"), // only possible operator right now.
      field("right", $.general_expression)
    )),

    /**
     * Comparison of two or more operands represented as {@link general_expression}.
     * 
     * https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENLOGEXP_COMP.html
     */
    comparison_expression: $ => seq(
      field("left", $.general_expression),
      choice(
        seq($._comparison_operator, field("right", $.general_expression)),
        seq(optional(kw("not")), field("right", $.range_expression)),
        seq(
          optional(kw("not")),
          kw("in"),
          field("right", choice(
            $.data_object,
            $.method_call
          ))
        )
      ),
    ),

    range_expression: $ => seq(
      kw("between"),
      field("low", $.general_expression),
      kw("and"),
      field("high", $.general_expression)
    ),

    /**
     * Constructs an internal table in {@link new_expression} and {@link reduce_expression}
     * 
     * Syntactically, there are no differences.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENNEW_CONSTRUCTOR_PARAMS_ITAB.html
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENVALUE_CONSTRUCTOR_PARAMS_ITAB.html
     */
    itab_expression: $ => seq(
      optional(seq($.let_expression, kw("in"))),
      optional(field("base", $.base_spec)),

      // Optionally any number of nested for expressions
      repeat($.iteration_expression),

      repeat1(
        seq(
          // Optionally any number of component defaults that apply to subsequent line specs
          repeat($.named_argument),
          $.line_spec
        )
      )
    ),

    // Specification / initialization of an itab with arguments (components)
    itab_spec: $ => seq(
      optional(field("base", $.base_spec)),
      $.argument_list
    ),

    base_spec: $ => seq(
      seq(kw("base"), field("value", $.data_object))
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENNEW_CONSTRUCTOR_PARAMS_LSPC.html
    // Empty line specs are possible and create initial lines.
    line_spec: $ => seq(
      "(",
      field("value", optional(
        choice(
          $.lines_of,
          $.argument_list,
        ))),
      ")"
    ),

    lines_of: $ => seq(
      // LINES OF ...
      ...kws("lines", "of"), field("jtab", $.identifier),
      optional(seq(kw("from"), field("from", $.data_object))),
      optional(seq(kw("to"), field("to", $.data_object))),
      optional(seq(kw("step"), field("step", $.data_object))),
      optional($.using_key_spec)
    ),

    /**
     * FOR [...] UNTIL/WHILE helper expression in constructor expressions.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENFOR.html
     */
    iteration_expression: $ => choice(
      $.conditional_iteration,
      $.table_iteration
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENFOR_CONDITIONAL.html
    conditional_iteration: $ => seq(
      kw("for"),
      $.iterator_var_spec,
      // Optional when `var` is numeric as it will be incremeted implicitly
      optional(
        seq(
          kw("then"),
          $.general_expression
        )
      ),
      choice(...kws("until", "while")),
      $.logical_expression,
      optional(seq($.let_expression, kw("in")))
    ),

    // Specification of an iterator variable
    iterator_var_spec: $ => seq(
      field("name", $.identifier),
      "=",
      field("value", $.general_expression)
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENFOR_ITAB.html
    table_iteration: $ => seq(
      kw("for"),

      choice(
        // simple internal table read
        seq(
          field("iterator", $.identifier),
          kw("in"),
          field("itab", $.identifier),
          optional(
            seq(...kws("index", "into"), field("index", $.identifier))
          ),
          optional($.iteration_cond),
        ),
        seq(
          kw("groups"), field("group", $.identifier),
          kw("of"), field("iterator", $.identifier),
          kw("in"), field("itab", $.identifier),
          optional(
            seq(...kws("index", "into"), field("index", $.number))
          ),
          optional($.iteration_cond),
          ...kws("group", "by"), field("group_key", $.group_key),
          optional(
            seq(
              choice(...kws("ascending", "descending")),
              optional(seq(...kws("as", "text")))
            )
          ),
          optional(seq(...kws("without", "members")))
        ),

      ),

      optional(seq($.let_expression, kw("in")))
    ),

    using_key_spec: $ => seq(
      ...kws("using", "key"),
      field("name", $.identifier)
    ),

    read_key_spec: $ => seq(
      kw("key"),
      field("name", $.identifier)
    ),

    /**
     * Iteration condition for a table iteration {@link loop} or {@link table_iteration}
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENFOR_COND.html
     */
    iteration_cond: $ => seq(
      optional($.using_key_spec),

      optional(seq(kw("from"), field("from", $.number))),
      optional(seq(kw("to"), field("to", $.number))),
      optional(seq(kw("step"), field("step", $.number))),

      kw("where"),
      choice(
        $.logical_expression,
        // statically specified logical expression log_exp must be placed in parenthese (table iterations)
        // The parantheses here could cause a conflict with logical expressions, so they need a higher precedence.
        seq("(", $.logical_expression, ")"),
        // dynamic where clause
        seq("(", $._immediate_identifier, token.immediate(")")),
        // special case, dynamic tab inside a table iteration
        seq("(", "(", $._immediate_identifier, token.immediate(")"), ")"),
      )
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPLOOP_AT_ITAB_GROUP_BY_KEY.html
    group_key: $ => choice(
      field("name", $.identifier),
      seq(
        "(",
        repeat1($.group_key_component_spec),
        ")"
      )
    ),

    /** Specifcation of a {@link group_key} component. */
    group_key_component_spec: $ => seq(
      field("field", $.identifier),
      "=",
      field("value",
        choice(
          seq(...kws("group", "index")),
          seq(...kws("group", "size")),
          $.general_expression
        )
      )
    ),

    // https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENPREDICATE_EXPRESSIONS.html
    // NOTE: Not all general expressions apparently? The docs are kind of vague here..
    predicate_expression: $ => choice(
      // operand
      seq($.identifier, kw("is"), optional(kw("not")), kw("initial")),
      // ref
      seq($.identifier, kw("is"), optional(kw("not")), kw("bound")),
      // oref
      seq($.identifier, kw("is"), optional(kw("not")), kw("instance"), kw("of")),
      // <fs>
      seq($.identifier, kw("is"), optional(kw("not")), kw("assigned")),
      // parameter
      seq($.identifier, kw("is"), optional(kw("not")), kw("supplied")),
    ),

    _comparison_operator: _ => choice(...kws(
      "=", "eq", "<>", "ne", ">", "gt", "<", "lt", ">=", "ge", "<=", "le",
      "co", "cn", "ca", "na", "cs", "ns", "cp", "np",
      "byte-co", "byte-cn", "byte-ca", "byte-na", "byte-cs", "byte-ns",
      "o", "z", "m"
    )),


    /**
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENTABLE_EXP_RESULT.html
     */
    table_expression: $ => seq(
      field("itab", $.data_object),
      "[",
      $.itab_line,
      "]"
    ),

    /**
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENTABLE_EXP_ITAB_LINE.html
     */
    itab_line: $ => choice(
      $.index_read,
      $.search_key_read
    ),

    /**
     * Index read variant of {@link itab_line}
     */
    index_read: $ => seq(
      // If a key is specified, `INDEX` must also be used.
      optional(
        seq(
          field("key", $.read_key_spec),
          kw("index")
        )
      ),
      field("index", $.numeric_expression)
    ),

    /**
     * Search key read variant of {@link itab_line}
     */
    search_key_read: $ => seq(
      // If a key is specified, `INDEX` must also be used.
      optional(
        seq(
          field("key", $.read_key_spec),
          optional(kw("components")) // can be omitted
        )
      ),
      $.search_key_components
    ),

    search_key_components: $ => repeat1($.itab_comp_spec),

    itab_comp_spec: $ => seq(
      field("comp", $.itab_comp),
      "=",
      field("value", $.general_expression)
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENITAB_COMPONENTS.html
    itab_comp: $ => choice(
      $.static_itab_comp,
      $._dynamic_itab_comp,
    ),

    /**
     * Static variant of {@link itab_comp}: `{ comp_name[-sub_comp][{+off(len)}|{->attr}] }`
     */
    static_itab_comp: $ => choice(
      $.identifier,
      $.struct_component_selector,
      $.object_component_selector
      // TODO: String access
    ),

    /**
     * Dynamic variant of {@link itab_comp}: `{ (name) }`
     */
    _dynamic_itab_comp: $ => alias($.dynamic_component, $.dynamic_itab_comp),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONSTRUCTOR_EXPRESSION_NEW.html
    new_expression: $ => prec(10, seq(
      kw("new"),
      field("type", $._constructor_result),
      token.immediate("("),
      optional(
        choice(
          /** See {@link argument_list} for the ambiguity */
          $.argument_list,
          $.itab_spec,
          $.itab_expression
        ),
      ),
      ")",
    )),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONSTRUCTOR_EXPRESSION_VALUE.html 
    value_expression: $ => prec(10, seq(
      kw("value"),
      field("type", $._constructor_result),
      token.immediate("("),
      optional(
        choice(
          // We technically know that this cant be an argument list and has to be
          // a list of field assignments since objects are not possible in `value`
          // but its better to avoid inconsistency with new expressions.
          $.argument_list,
          $.itab_spec,
          $.itab_expression
        ),
      ),
      ")",
    )),

    // https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/abenconditional_expression_cond.html
    cond_expression: $ => seq(
      kw("cond"),
      field("type", $._constructor_result),
      "(",
      optional(seq($.let_expression, kw("in"))),
      repeat1(alias($._cond_case, $.case)),
      optional(alias($._else_case, $.case)),
      ")"
    ),

    // https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/abenconditional_expression_switch.html
    switch_expression: $ => seq(
      kw("switch"),
      field("type", $._constructor_result),
      "(",
      field("operand", $.data_object),
      optional(seq($.let_expression, kw("in"))),
      repeat1(alias($._switch_case, $.case)),
      optional(alias($._else_case, $.case)),
      ")"
    ),

    _cond_case: $ => seq(
      kw("when"),
      field("predicate", $.logical_expression),
      kw("then"),
      optional(seq($.let_expression, kw("in"))),
      field("result", $._conditional_result)
    ),

    _switch_case: $ => seq(
      kw("when"),
      field("predicate", $.data_object),
      kw("then"),
      optional(seq($.let_expression, kw("in"))),
      field("result", $._conditional_result)
    ),

    _else_case: $ => seq(
      kw("else"), optional(seq($.let_expression, kw("in"))),
      field("result", $._conditional_result)
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPLET.html
    let_expression: $ => seq(
      kw("let"),
      repeat1($.let_spec)
    ),

    /** Specification for a single local helper variable in a {@link let_expression}. */
    let_spec: $ => choice(
      seq(
        field("name", $.identifier),
        "=",
        field("value", $.general_expression)
      )
    ),

    /**
     * Possible of a {@link cond_expression} or {@link switch_expression}.
     * 
     * https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENCONDITIONAL_EXPRESSION_RESULT.html
     */
    _conditional_result: $ => choice(
      $.general_expression,
      $.throw_exception
    ),

    throw_exception: $ => seq(
      kw("throw"),
      optional(kw("resumable")),
      optional(kw("shortdump")),
      field("name", $.identifier),
      "(", optional(seq(kw("message"), $.message_spec,)), ")",
    ),

    /**
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abapmessage.html
     */
    message: $ => choice(
      seq(
        kw("message"),
        $.message_spec,
      )
    ),

    /**
     * Inner specification of a {@link message}.
     * 
     * Needed as `message` can either be a statement that displays multiple messages at once..
     * ```
     * message: e888(msg_class) with 'Foo' 'Bar' 'Baz', 
     *          i222(msg_class) with '1' '2' '3'.
     * ```
     * Or, in certain other contexts, a `message` can also be a statement for raising
     * an exception from a message. See {@link throw_exception}
     */
    message_spec: $ => seq(
      choice(
        // { tn } / { tn(id) }
        seq(
          field("type", $.message_type),
          field("num", $._immediate_number),
          // Optional if specified at program level
          optional(
            seq(
              token.immediate("("),
              field("id", $._immediate_identifier),
              token.immediate(")"),
            )
          )
        ),
        // { ID mid TYPE mtype NUMBER num }
        seq(
          kw("id"), field("id", $.identifier),
          kw("type"), field("type", $.message_type),
          kw("number"), field("num", $.number),
        ),
        // { oref [TYPE mtype] }
        seq(
          field("oref", $.identifier),
          optional(seq(kw("type"), field("type", $.message_type)))
        ),
        // text TYPE mtype
        seq(
          field("text", $.literal_string),
          optional(seq(kw("type"), field("type", $.message_type)))
        ),
      ),
      // [DISPLAY LIKE dtype]
      optional(field("display", $.display_override)),
      // [WITH dobj1 ... dobj4]
      field("arguments", optional($.message_arguments)),

      // Do we make these into their own nodes? Probably should..
      optional(
        choice(
          // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMESSAGE_INTO.html
          seq(kw("into"), field("text", $.identifier)),
          // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMESSAGE_RAISING.html
          seq(kw("raising"), field("exception", $.identifier)),
        )
      )
    ),

    message_arguments: $ => seq(
      kw("with"), repeat1($.general_expression)
    ),

    display_override: $ => seq(
      seq(...kws("display", "like"), field("type", $.message_type))
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCONCATENATE.html
    concatenate: $ => seq(
      kw("concatenate"),
      choice(
        $.data_object_list,
        $.lines_of,
      ),
      $.into_clause,
      optional($.string_processing_spec),
      optional($.separator_spec),
      optional($.respecting_blanks),
      "."
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCONDENSE.html
    condense: $ => seq(
      kw("condense"),
      field("text", $.data_object),
      optional(alias(kw("no-gaps"), $.no_gaps)),
      "."
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSPLIT.html
    split: $ => seq(
      kw("split"),
      field("dobj", $.data_object),
      $.separator_spec,
      $.into_clause,
      optional($.string_processing_spec),
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPFIND.html
    find: $ => seq(
      kw("find"),
      optional($.occurrence_spec),
      $.pattern,
      kw("in"),
      optional($.section),
      field("dobj", $.data_object),
      optional($.string_processing_spec),
      optional($.find_options)
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREPLACE.html
    replace: $ => choice(
      $.pattern_based_replacement,
      $.position_based_replacement
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREPLACE_IN_PATTERN.html
    pattern_based_replacement: $ => seq(
      kw("replace"),
      optional($.occurrence_spec),
      $.pattern,
      kw("in"),
      optional($.section),
      field("dobj", $.data_object),
      kw("with"),
      field("new", $.data_object),
      optional($.string_processing_spec),
      optional($.replace_options)
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREPLACE_IN_POSITION.html
    position_based_replacement: $ => seq(
      kw("replace"),
      optional($.section),
      field("dobj", $.data_object),
      kw("with"),
      field("new", $.data_object),
      optional($.string_processing_spec)
    ),

    /**
     * Into clause of various expressions. The concrete form depends on the context.
     * 
     * `INTO { {result1 result2 [...]} | {TABLE result_tab} }`
     * 
     * For certain variants, like a {@link split} statement, scalar and tabular result variables
     * can be defined within one statement: 
     * 
     * `... INTO: FINAL(str1) FINAL(str2) FINAL(str3), TABLE FINAL(itab).`
     */
    into_clause: $ => prec.right(
      seq(
        kw("into"),
        choice(
          // A single table result spec is allowed without colons..
          $.table_result_spec,
          // ... or multiple regular result specs without colon..
          repeat1($.result_spec),
          // ... or, with a colon, first 0 to n regular and 0 to k table results
          seq(
            ":",
            choice(
              repeat1($.table_result_spec),
              repeat1($.result_spec),
              seq(
                repeat1($.result_spec),
                ",",
                repeat1($.table_result_spec)
              ),
            ),
          ),
        )
      )
    ),

    result_spec: $ => choice(
      $.data_object,
      $.declaration_expression
    ),

    table_result_spec: $ => seq(
      kw("table"),
      choice(
        $.data_object,
        $.declaration_expression
      )
    ),

    /**
     * Specification of the processing mode (byte | character) for various statements.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENSTRING_PROCESSING_STATEMENTS.html
     */
    string_processing_spec: _ => seq(
      kw("in"),
      field("mode", choice(...kws("character", "byte"))),
      kw("mode")
    ),

    // Specification of a separator character in various statements.
    separator_spec: $ => seq(
      choice(
        seq(...kws("separated", "by")),
        kw("at")
      ),
      field("sep", $.data_object)
    ),

    /**
     * Specifies occurrences in a {@link replace} statement.
     */
    occurrence_spec: _ => seq(
      choice(
        seq(...kws("first", "occurrence")),
        seq(...kws("all", "occurrences")),
      ),
      kw("of")
    ),

    /**
     * Specifies a pattern to replace for a {@link replace} statement.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREPLACE_PATTERN.html
     */
    pattern: $ => choice(
      $.substring_spec,
      $.pcre_spec,
      $.regex_spec
    ),

    substring_spec: $ => seq(optional(kw("substring")), field("value", $.data_object)),
    pcre_spec: $ => seq(kw("pcre"), field("value", $.data_object)),
    regex_spec: $ => seq(kw("regex"), field("value", $.data_object)),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREPLACE_OPTIONS.html
    replace_options: $ => repeat1(
      choice(
        $.verbatim,
        $.case_sensitivity_spec,
        $.operation_count_spec,
        $.operation_offset_spec,
        $.operation_length_spec,
        $.operation_results_spec
      )
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPFIND_OPTIONS.html
    find_options: $ => repeat1(
      choice(
        $.case_sensitivity_spec,
        $.operation_count_spec,
        $.operation_offset_spec,
        $.operation_length_spec,
        $.operation_results_spec,
        $.submatches_spec
      )
    ),

    /**
     * Specification of a case sensitivity in various string operations.
     * 
     * `RESPECTING/IGNORING CASE`
     */
    case_sensitivity_spec: _ => seq(
      field("case", choice(...kws("respecting", "ignoring"))),
      kw("case")
    ),

    /**
     * Specification of an operation count result variable in various string operations.
     * 
     * `REPLACEMENT/MATCH COUNT cnt`
     */
    operation_count_spec: $ => seq(
      choice(...kws("replacement", "match")),
      kw("count"),
      field("cnt", choice(
        $.data_object,
        $.declaration_expression
      ))
    ),

    /**
     * Specification of an operation offset result variable in various string operations.
     * 
     * `REPLACEMENT/MATCH OFFSET off`
     */
    operation_offset_spec: $ => seq(
      choice(...kws("replacement", "match")),
      kw("offset"),
      field("off", choice(
        $.data_object,
        $.declaration_expression
      ))
    ),

    /**
     * Specification of an operation length result variable in various string operations.
     * 
     * `REPLACEMENT/MATCH LENGTH len`
     */
    operation_length_spec: $ => seq(
      choice(...kws("replacement", "match")),
      kw("length"),
      field("len", choice(
        $.data_object,
        $.declaration_expression
      ))
    ),

    /**
     * Specifies a target variable to safe the individual operations to.
     * 
     * RESULTS result_tab|result_wa
     */
    operation_results_spec: $ => seq(
      kw("results"),
      field("result", choice(
        $.data_object,
        $.declaration_expression
      ))
    ),

    /**
     * Specifies subgroup registers in a {@link find} statement.
     * 
     * `SUBMATCHES s1 s2 ...`
     */
    submatches_spec: $ => prec.right(
      seq(
        kw("submatches"),
        repeat1(
          choice(
            $.data_object,
            $.declaration_expression
          )
        )
      )
    ),

    /**
     * Section specification used in various string processing statements.
     *
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPFIND_SECTION_OF.html
     */
    section: $ => seq(
      kw("section"),
      repeat(
        choice(
          seq(kw("offset"), field("off", $.numeric_expression)),
          seq(kw("length"), field("len", $.numeric_expression)),
        )
      ),
      kw("of")
    ),

    verbatim: _ => kw("verbatim"),

    /**
     * Specifies that a {@link concatenate} statement should respect blanks.
     */
    respecting_blanks: $ => seq(
      ...kws("respecting", "blanks")
    ),

    /**
     * A list of {@link data_object} for various expressions.
     */
    data_object_list: $ => repeat1($.data_object),

    _constructor_result: $ => choice(
      "#", // inferred
      $.identifier // explicit
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENINLINE_DECLARATIONS.html
    declaration_expression: $ => seq(
      choice(...kws("final", "data", "field-symbol")),
      // Do we use immediate here? Does that fall under being permissive?..
      token.immediate("("),
      field("name", $._immediate_identifier),
      token.immediate(")")
    ),

    /**
     * An assignment **statement**, not an expression!
     * 
     * TODO: Calculation assignments:
     * https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENCALCULATION_ASSIGNMENT_GLOSRY.html
     * 
     * Operand rules: 
     * https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENEQUALS_OPERATOR.html
     * 
     * See: https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENVALUE_ASSIGNMENTS.html
     */
    assignment: $ => seq(
      // Either a single destination or multiple, restrictions apply when multiple.
      choice(
        seq(
          field("left",
            choice(
              $.data_object,
              $.declaration_expression,
              $.writable_expression,
            )
          ),
          "=",
        ),
        field("destination",
          repeat1(
            prec.left(seq($.data_object, "="))
          )
        )
      ),
      field("right", $.general_expression),
      "."
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENMETHOD_CALLS.html
    method_call: $ => prec.right(5, seq(
      // only a single identifier allowed for static calls
      choice(
        field("source",
          seq(
            $.identifier,
            token.immediate("=>")
          ),
        ),
        field("source",
          seq(
            choice(
              $.identifier,
              $.method_call,
              $.data_component_selector,
              $.new_expression
            ),
            token.immediate("->")
          ),
        ),
      ),
      field("name", $._immediate_identifier),
      $.call_arguments
    )),

    /**
     * Call of a builtin function. Technically it would be possible to make all
     * of the functions known statically since they cannot be dynamically declared,
     * but its easier to just do it dynamically.
     * 
     * Its not currently possible to declare functions to be called the same way builtin
     * functions can be called, so theres no conflict.
     */
    builtin_function_call: $ => prec.right(5, seq(
      field("name", $.identifier),
      $.call_arguments
    )),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCALL_METHOD_PARAMETERS.html
    call_arguments: $ => seq(
      token.immediate("("),

      // If no exporting / importing  etc, is specified, all arguments are exporting
      choice(
        field("exporting", $.argument_list),
        repeat(
          choice(
            args("exporting", $.argument_list),
            args("importing", $.argument_list),
            args("changing", $.argument_list),
            args("exceptions", $.argument_list),
            args("receiving", $.named_argument),
          )
        ),
      ),
      ")",
    ),

    /**
     * In something like a {@link new_expression}, an assignment list could either 
     * refer to constructor parameters or components of a structure, it is completely
     * ambiguous and can only be resolved knowing the actual type of the expression result.
     */
    argument_list: $ => seq(
      optional(seq($.let_expression, kw("in"))),
      choice(
        repeat1($.named_argument),
        repeat1($._positional_argument)
      )
    ),

    named_argument: $ => seq(
      field("param",
        choice(
          $.identifier,
          $.struct_component_selector // for components of structures
        )
      ),
      "=",
      field("value",
        choice(
          $.general_expression,
          $.declaration_expression
        )
      )
    ),

    _positional_argument: $ => alias($.general_expression, $.positional_argument),

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
      // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPTYPES_KEYDEF.html
      repeat($.table_key_spec),
      repeat(choice(
        seq(
          ...kws("initial", "size"),
          field("initial_size", $.number)
        ),
        seq(...kws("value", "is", "initial")),

        seq(...kws("with", "further", "secondary", "keys")),
        seq(...kws("without", "further", "secondary", "keys")),
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
     * Standalone Data Types vs Bound Data Types: 
     * https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENDOBJ_GENERAL.html
     * 
     * See also: https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDATA_REFERRING.html
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
      kw("class"), field("name", $.identifier), kw("definition"),
      optional($.class_options), ".",
      alias(optional($._class_sections), $.body),
      kw("endclass"), "."
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPINTERFACE.html
    interface_definition: $ => seq(
      kw("interface"), field("name", $.identifier), optional(kw("public")), ".",
      // no public / protected / private sections in interfaces, all public.
      alias(repeat($._class_component), $.body),
      kw("endinterface"), "."
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS_IMPLEMENTATION.html
    class_implementation: $ => seq(
      kw("class"), field("name", $.identifier), kw("implementation"), ".",
      repeat($.method_implementation),
      kw("endclass"), "."
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS_IMPLEMENTATION.html
    interface_implementation: $ => seq(
      kw("interface"), field("name", $.identifier), kw("implementation"), ".",
      kw("endinterface"), "."
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS_DEFERRED.html
    deferred_class_definition: $ => seq(
      kw("class"), field("name", $.identifier), ...kws("definition", "deferred"),
      "."
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS_DEFERRED.html
    deferred_interface_definition: $ => seq(
      kw("interface"), field("name", $.identifier), ...kws("deferred"), optional(kw("public")),
      "."
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS_LOCAL_FRIENDS.html
    local_friends_spec: $ => seq(
      kw("class"),
      field("name", $.identifier),
      ...kws("definition", "local", "friends"),
      repeat1($.identifier),
      "."
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS_OPTIONS.html
    class_options: $ => seq(
      // can appear in any order
      repeat1(
        choice(
          kw("public"),
          // classes can only inherit from 0 to 1 superclasses.
          seq(...kws("inheriting", "from"), field("parent", $.identifier)),
          kw("abstract"),
          kw("final"),
          seq(kw("create"), field("create_visibility", $._visibility)),
          field("testing", $.for_testing_spec),
          seq(...kws("shared", "memory", "enabled")),
          seq(...kws("for", "behavior", "of"), field("behavior_ref", $.identifier)),
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
      repeat1($.identifier)
    ),

    // Components of a class
    _class_sections: $ => repeat1(
      // Technically they have to be in order. But lets be permissive here..
      choice(
        $.public_section,
        $.protected_section,
        $.private_section,
      )
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
        seq(":", commaSep1($.method_spec)),
        $.method_spec
      ),
      "."
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS-METHODS.html
    cls_methods_declaration: $ => seq(
      kw("class-methods"),
      choice(
        seq(":", commaSep1($.method_spec)),
        $.method_spec
      ),
      "."
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPALIASES.html
    alias_declaration: $ => seq(
      kw("aliases"),
      choice(
        seq(":", commaSep1($.alias_spec)),
        $.alias_spec
      ),
      "."
    ),

    interfaces_declaration: $ => seq(
      kw("interfaces"),
      choice(
        seq(":", commaSep1($.identifier)),
        $.identifier
      ),
      "."
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
      field("name", choice(
        // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHODS_CONSTRUCTOR.html
        ...kws("constructor", "class_constructor"),
        $.identifier,
      )),
      repeat(
        choice(
          kw("abstract"),
          kw("final"),
          // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHODS_REDEFINITION.html
          kw("redefinition"),
          // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHODS_TESTING.html
          seq(...kws("for", "testing")),
          $.interface_default,
          $.cds_function_impl,
          // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHODS_EVENT_HANDLER.html
          field("event", $.event_handling),
          // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENAMDP_METHODS.html
          field("amdp", $.amdp_options),
          // Parameter lists
          params("importing", $.parameter_list),
          params("exporting", $.parameter_list),
          params("changing", $.parameter_list),
          params("raising", $.raising_list),
          params("exceptions", $.exception_list),
          params("returning", alias($.parameter, $.return_value)),
        )
      )
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPALIASES.html
    alias_spec: $ => seq(
      field("alias", $.identifier),
      kw("for"),
      $.interface_component_selector
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHODS_EVENT_HANDLER.html
    event_handling: $ => seq(
      ...kws("for", "event"),
      field("event", $.identifier),
      kw("of"),
      field("source", $.identifier),
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHODS_DEFAULT.html
    interface_default: _ => seq(
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

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHODS_AMDP_OPTIONS.html
    amdp_options: $ => seq(
      ...kws("amdp", "options"),
      repeat1(
        choice(
          kw("read-only"),
          field("client_handling", $.amdp_client_handling)
        )
      )
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHODS_AMDP_OPTIONS_CLIENT.html
    amdp_client_handling: $ => choice(
      seq(...kws("cds", "session", "client", "dependent")),
      seq(...kws("client", "independent")),
      seq(
        ...kws("cds", "session", "client"),
        field("client", choice(
          $.identifier,
          kw("current")
        )
        )
      ),
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS-METHODS_FOR_TABFUNC.html
    cds_function_impl: $ => choice(
      seq(...kws("for", "table", "function"), field("view", $.identifier)),
      seq(...kws("for", "scalar", "function"), field("function", $.identifier)),
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHODS_PARAMETERS.html
    parameter: $ => prec.right(seq(
      // The addition `value` and `reference` is optional (reference is default)
      choice(
        seq(
          // Old way to make sure the compiler would not mistake identifiers for keywords,
          // not needed anymore but still seen alot.
          optional("!"),
          field("name", $.identifier),
        ),
        seq(
          choice(...kws("value", "reference")),
          token.immediate("("),
          field("name", $._immediate_identifier),
          token.immediate(")")
        ),
      ),
      field("typing", optional($._typing)),
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
      field("name", $.identifier),
      seq(
        kw("resumable"),
        token.immediate("("),
        field("name", $.identifier),
        token.immediate(")"),
      )
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPMETHOD.html
    method_implementation: $ => seq(
      kw("method"),
      field("name",
        choice(
          $.identifier,
          $.interface_component_selector
        )
      ),
      ".",
      optional($.method_body),
      kw("endmethod"),
      "."
    ),

    method_body: $ => repeat1($._statement),

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
    table_key_spec: $ => prec.right(
      seq(
        kw("with"),
        choice(
          $._primary_key,
          $._secondary_key,
        )
      )
    ),

    /**
     * Primary table key, works a little different than secondary keys.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPTYPES_PRIMARY_KEY.html
     */
    _primary_key: $ => choice(
      seq(...kws("empty", "key")),
      seq(
        optional(choice(...kws("unique", "non-unique"))),
        choice(
          seq(...kws("default", "key")),
          seq(
            kw("key"),
            optional(
              seq(
                field("name", kw("primary_key")),
                optional(seq(kw("alias"), field("alias", $.identifier))),
                kw("components")
              )
            ),
            $.table_components
          )
        )
      )
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPTYPES_SECONDARY_KEY.html
    _secondary_key: $ => seq(
      choice(
        seq(...kws("unique", "hashed")),
        seq(...kws("unique", "sorted")),
        seq(...kws("non-unique", "sorted")),
      ),
      kw("key"),
      field("name", $.identifier),
      optional(seq(kw("alias"), field("alias", $.identifier))),
      kw("components"), $.table_components

    ),

    table_components: $ => prec.right(repeat1($.identifier)),

    /**
     * INCLUDE {TYPE | STRUCTURE} inside struct declaration (BEGIN OF...).
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPINCLUDE_TYPE.html
     */
    struct_include: $ => seq(
      kw("include"),
      field("name", choice(
        seq(kw("type"), $.identifier),
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

    // A component selector superclass that can return a data type
    data_component_selector: $ => choice(
      $.struct_component_selector,
      $.object_component_selector,
      $.class_component_selector,
      $.interface_component_selector,
      $.dereference
    ),

    static_component: $ => choice(
      field("name", $._immediate_identifier)
    ),

    dynamic_component: $ => seq(
      token.immediate("("),
      field("name", choice(
        $._immediate_identifier,
        $._immediate_literal_string
      )),
      token.immediate(")")
    ),

    /**
     * Accesses a component `comp` of a structure or structured data type `struct`.
     * 
     * `struct-comp` or `struc-(comp)`
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENSTRUCTURE_COMPONENT_SELECTOR.html
     */
    struct_component_selector: $ => seq(
      // Name of a structure or a structured type that can itself be linked.
      // Functional method call or method chaining with a structured result.
      // Single or chained table expression that returns a structured table line.
      field("struct",
        choice(
          $.identifier,
          $.data_component_selector,
          $.method_call,
          $.table_expression
        )
      ),
      token.immediate("-"),
      field("comp",
        choice(
          $.dynamic_component,
          $.static_component
        )
      )
    ),

    /**
     * Accesses a component `comp` of an object
     * 
     * `ref->comp` or `ref->(comp)`
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENOBJECT_COMPONENT_SELECTOR.html
     */
    object_component_selector: $ => seq(
      // - Name of a reference variable that can itself be a composite.
      // - Functional method call or method chaining with a reference variable as a result.
      // - Single or chained table expression whose result is a reference variable.
      // - Constructor expression with the instance operator NEW or the casting operator CAST
      field("ref",
        choice(
          $.identifier,
          $.data_component_selector,
          $.method_call,
          $.new_expression,
          $.table_expression
          // TODO: Cast expression
        )
      ),
      token.immediate("->"),
      field("comp",
        choice(
          $.dynamic_component,
          $.static_component
        )
      )
    ),

    /**
     * Accesses a static component `comp` of class `class`. Dynamic access is not possible.
     * 
     * Can also be used to access types `type` or constants `const` of interfaces.
     * 
     * `class=>comp` or `intf=>type` or `intf=>const`
     */
    class_component_selector: $ => seq(
      field("class", $.identifier),
      token.immediate("=>"),
      field("comp", $._immediate_identifier)
    ),

    /**
     * Accesses component `comp` of an interface `intf`.
     * 
     * `intf~comp`
     *
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENINTERFACE_COMPONENT_SELECTOR.html
     */
    interface_component_selector: $ => seq(
      field("intf",
        choice(
          $.identifier,
          $.data_component_selector,
          $.method_call,
          $.new_expression,
          $.table_expression
        )
      ),
      token.immediate("~"),
      field("comp", $._immediate_identifier)
    ),

    /**
     * Accesses the content of a data object  pointed to by a data reference `dref`.
     * 
     * `dref->*`
     * 
     * Similar to the {@link object_component_selector} except that the immediate dref is accessed.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENDEREFERENCING_OPERATOR.html
     */
    dereference: $ => seq(
      // - Name of a reference variable that can itself be a composite.
      // - Functional method call or method chaining with a reference variable as a result.
      // - Single or chained table expression whose result is a reference variable.
      // - Constructor expression with the instance operator NEW or the casting operator CAST
      field("dref",
        choice(
          $.identifier,
          $.data_component_selector,
          $.method_call,
          $.new_expression,
          $.table_expression
          // TODO: Cast expression
        )
      ),
      token.immediate("->*"),
    ),

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

    _immediate_identifier: $ => alias(token.immediate(IDENTIFIER_REGEX), $.identifier),

    number: _ => NUMBER_REGEX,
    _immediate_number: $ => alias(token.immediate(NUMBER_REGEX), $.number),
    _immediate_literal_string: $ => alias(
      choice(
        token.immediate(/'[^']*'/),
        token.immediate(/`[^`]*`/),
      ),
      $.literal_string
    ),

    literal_string: $ => choice(
      /'[^']*'/,
      /`[^`]*`/
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENSTRING_TEMPLATES_EXPRESSIONS.html
    string_template: $ => seq(
      // Must allow " directly after the pipe, otherwise the inline comment rule strikes..
      /[|](["#]*)/,
      repeat(
        choice(
          // Allow {,  } and | when escaped
          /(?:\\.|[^{}|])+/,
          $.embedded_expression
        )
      ),
      "|"
    ),

    // A general expression position within a template string
    // TODO: Figure out general expression position & functional expression position
    //
    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENGENERAL_EXPR_POSITION_GLOSRY.html
    embedded_expression: $ => seq(
      "{",
      $.general_expression,
      repeat($.format_option),
      "}"
    ),

    /**
     * String template formatting arguments, e.g `ALPHA = IN`.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCOMPUTE_STRING_FORMAT_OPTIONS.html
     */
    format_option: $ => seq(
      // FIXME: Treated as keywords by eclipse..
      field("parameter", $.identifier),
      "=",
      field("value", choice(
        // FIXME: Technically these are keywords
        $.identifier,
        $.literal_string,
        $.number,
        // dynamic dobj specification, do we wrap this in something for querying?
        seq("(", $._immediate_identifier, token.immediate(")")),
        $.method_call
      ))
    ),

    inline_comment: _ => prec(0, seq('"', /[^\n\r]*/)),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abenpseudo_comment.html
    pseudo_comment: $ => prec(1, seq(
      '"#',
      alias(token.immediate(/[^ ][^ ]/), $.kind),
      $._ws,
      alias(/[^\n\r]*/, $.code)
    )),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENPRAGMA.html
    pragma: $ => seq(
      '##',
      alias(token.immediate(/[^\n\r# ]+/), $.code),
      // Up to 2 parameters are possible, but extras dont allow optionals.
      // While this hack does work fine, it unfortunately causes the parameter nodes
      // to always show up in the tree even when no parameter are specified.
      // So im not sure if I want to have it that way.
      // /\[?/, alias(token.immediate(/[^\n\r\]]*/), $.param), /\]?/,
      // /\[?/, alias(token.immediate(/[^\n\r\]]*/), $.param), /\]?/,
    ),


    _ws: _ => /\s/,

    /**
     * When not currently inside a statement, ABAP allows spraying `...` all over the place.
     * 
     * For example, this is valid:
     * ```abap
     * METHOD meth.
     * ...  m2( ) ...
     * ENDMETHOD.
     * ```
     * whereas this would be invalid...
     * ```abap
     * METHOD meth.
     * data(lv_result) =  ... m2( ) ...
     * ENDMETHOD.
     * ```
     * ... because it violates the 'not being inside a simple statement' rule.
     */
    _empty_statement: _ => token("."),
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
        optional(field("type", $._typing))
      ),

      structureSpec($, undefined, $.identifier, $[comp]),
      structureSpec($, keyword, $.identifier, $[comp]),
    );

    rules[name] = $ => choice(
      seq(
        field("name", identifierNode($)),
        optional(field("type", $._typing))
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
        $.identifier,
        $.data_component_selector
      ))
    ),
    seq(
      kw("like"),
      addition,
      field("dobj", choice(
        $.identifier,
        $.data_component_selector
      ))
    ),
  );
}

function params(keyword, rule) {
  return field(keyword, seq(kw(keyword), rule));
}

function args(keyword, rule) {
  return field(keyword, seq(kw(keyword), rule));
}