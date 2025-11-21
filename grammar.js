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
    $.relational_expression,
    $.data_object,
    $._simple_statement,
    $._compound_statement,
  ],

  conflicts: $ => [
    [$.argument_list]
  ],

  word: $ => $.identifier,

  rules: {
    source: $ => repeat($._statement),

    _statement: $ => choice(
      $._simple_statement,
      $._compound_statement
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

      $._empty_statement,
    ),

    // Statements that have a body. As a rule of thumb, that at least encompasses any kind of
    // statement that needs to be terminated with `END[...]` such as `ENDWHILE`, `ENDMETHOD`..
    _compound_statement: $ => choice(
      $.class_definition,
      $.class_implementation,
      $.interface_definition,
      $.interface_implementation,
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
      $.string_template,
      // TODO: Access to data objects (fields) of structs / objects
      // Explicit text symbols? https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENTEXT_SYMBOLS.html
    ),

    // https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENGENERAL_EXPR_POSITION_GLOSRY.html
    general_expression: $ => choice(
      $.data_object,
      $.constructor_expression,
      $.builtin_function_call,
      $.method_call, // By design, this also covers chained method calls
      // TODO: table expressions
      // TODO: calculation expressions
    ),

    /**
     * A LHS operand that can be written to, can be specified in **write positions**.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENWRITABLE_EXPRESSION_GLOSRY.html
     */
    writable_expression: $ => choice(
      // TODO: Table expressions
      // TODO: NEW/CAST expressions
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

    // https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENRELATIONAL_EXPRESSION_GLOSRY.html
    relational_expression: $ => choice(
      $.comparison_expression,
      $.predicate_expression
    ),

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
          //FIXME: Anything that can evaluate into a range table
          field("right", choice(
            $.identifier,
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
      optional($.base_spec),
      // Optionally any number of nested for expressions
      repeat($.iteration_expression),

      // TODO: Or a single field assignment to provide a subsequent default
      repeat1(
        seq(
          repeat(alias($.parameter_assignment, $.assignment)),
          $.line_spec
        )
      )
    ),

    base_spec: $ => seq(
      seq(kw("base"), field("name", $.identifier))
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENNEW_CONSTRUCTOR_PARAMS_LSPC.html
    // Empty line specs are possible and create initial lines.
    line_spec: $ => seq(
      "(",
      field("value", optional(
        choice(
          $.lines_of,
          $.component_list,
          $.general_expression,
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
      alias($.parameter_assignment, $.assignment),

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

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONSTRUCTOR_EXPRESSION_NEW.html
    new_expression: $ => prec(10, seq(
      kw("new"),
      field("type", $._constructor_result),
      token.immediate("("),

      // can be empty (initial, a single operand (value), )
      optional(
        choice(
          // let expressions can be specified before dobj or argument list.
          // whether as single argument is a parameter or a dobj is impossible
          // to tell purely from context, it depends on the `type`.
          seq(
            optional(seq($.let_expression, kw("in"))),
            choice(
              $.component_list,
              $.argument_list,
              $.general_expression,
              $.itab_expression
            ),
          ),
        ),
      ),
      ")",
    )
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONSTRUCTOR_EXPRESSION_VALUE.html 
    value_expression: $ => seq(
      kw("value"),
      field("type", $._constructor_result),
      "(",
      optional(seq($.let_expression, kw("in"))),
      repeat1(alias($._cond_case, $.case)),
      optional(alias($._else_case, $.case)),
      ")"
    ),

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
    method_call: $ => seq(
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
              // access rules must be left associative for this to not conflict
              alias($._component_field_access, $.component_access),
              alias($._static_field_access, $.static_access),
              alias($._instance_field_access, $.instance_access),
            ),
            token.immediate("->")
          ),
        ),
      ),
      field("name", $._immediate_identifier),
      $.call_arguments
    ),

    /**
     * Call of a builtin function. Technically it would be possible to make all
     * of the functions known statically since they cannot be dynamically declared,
     * but its easier to just do it dynamically.
     * 
     * Its not currently possible to declare functions to be called the same way builtin
     * functions can be called, so theres no conflict.
     */
    builtin_function_call: $ => seq(
      field("name", $.identifier),
      $.call_arguments
    ),

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
            args("receiving", $.parameter_assignment),
          )
        ),
      ),
      ")",
    ),


    argument_list: $ => choice(
      repeat1($.general_expression),
      repeat1($.parameter_assignment)
    ),

    component_list: $ => seq(
      optional($.base_spec),
      repeat1($.comp_assignment)
    ),

    comp_assignment: $ => seq(
      field("param", $.identifier), // or a component selector
      "=",
      field("value", $.general_expression)
    ),

    parameter_assignment: $ => prec(7, seq(
      field("param", $.identifier),
      "=",
      field("value",
        choice(
          $.writable_expression,
          $.data_object,
          $.declaration_expression
        )
      )
    )),

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
      $.interface_access
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

    interface_access: $ => seq(
      field("interface", $.identifier),
      token.immediate("~"),
      field("component", $._immediate_identifier)
    ),

    /** 
     * Static access to a member of a class using `cls=>member`.
     * 
     * Must be followed by immediate accesses.
     */
    _static_field_access: $ => prec.left(seq(
      field("source", $.identifier),
      token.immediate("=>"),
      field("member", choice(
        $._immediate_identifier,
        alias($._immediate_instance_field_access, $.instance_access),
        alias($._immediate_component_field_access, $.component_access)
      ))
    )),

    /**
     * Instance access to a class member using `instance->member`.
     * 
     * Must be followed by immediate accesses.
     */
    _instance_field_access: $ => prec.left(seq(
      field("source", $.identifier),
      token.immediate("->"),
      field("member", choice(
        $._immediate_identifier,
        alias($._immediate_instance_field_access, $.instance_access),
        alias($._immediate_component_field_access, $.component_access)
      ))
    )),

    /** 
     * Static access to a type member of a class using `cls=>type`.
     * 
     * Must be followed by immediate accesses.
     */
    _static_type_access: $ => seq(
      field("source", $.identifier),
      token.immediate("=>"),
      field("member", choice(
        $._immediate_identifier,
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
        $._immediate_identifier,
        alias($._immediate_instance_type_access, $._instance_type_access),
      ))
    ),

    _immediate_instance_field_access: $ => prec.left(seq(
      field("source", $._immediate_identifier),
      token.immediate("->"),
      field("member", choice(
        $._immediate_identifier,
        alias($._immediate_component_field_access, $.component_access),
        alias($._immediate_instance_field_access, $._instance_field_access)
      ))
    )),

    _immediate_instance_type_access: $ => seq(
      field("source", $._immediate_identifier),
      token.immediate("->"),
      field("member", choice(
        $._immediate_identifier,
        alias($._immediate_instance_type_access, $._instance_type_access)
      ))
    ),

    _component_field_access: $ => componentAccess($, $.identifier),
    _component_type_access: $ => componentAccess($, $.identifier),

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

    _immediate_identifier: $ => alias(token.immediate(IDENTIFIER_REGEX), $.identifier),

    number: _ => NUMBER_REGEX,
    _immediate_number: $ => alias(token.immediate(NUMBER_REGEX), $.number),

    literal_string: $ => choice(
      seq(
        "'",
        field("content", /[^']*/),
        "'"
      ),
      seq(
        "`",
        field("content", /[^`]*/),
        "`"
      )
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENSTRING_TEMPLATES_EXPRESSIONS.html
    string_template: $ => seq(
      "|",
      repeat(
        choice(
          // Allow { and } inside the literal chunks when escaped
          /([^|{}]|\\\{|\\\})+/,
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

function args(keyword, rule) {
  return field(keyword, seq(kw(keyword), rule));
}