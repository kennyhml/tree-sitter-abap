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
const IDENTIFIER_REGEX = /[a-zA-Z_\/][a-zA-Z\d_/]*/;

// ABAP does allow + and - before any number. However, allowing both inside the regex, we run
// into an issue where the lexer considers the offset in a substring access like str+10 as 
// a single positive number token. I believe the minus should be safe though, so we can at
// least allow that. An explicit + is rarely ever needed anyway..
const NUMBER_REGEX = /-?\d+/;

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

    $._docstring_continuation,

    $.doctag_text,

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
     */
    $.line_comment,
    $.inline_comment,
    $.pseudo_comment,
    $.pragma,
    $.multi_line_comment,

    /**
     * THIS MUST BE A REGEX! Putting this inside a rule or the external scanner will
     * token.immediate() to not enforce the absence of whitespaces. In return, that
     * causes some complications inside the external scanner (explained there).
     */
    /\s/,
  ],

  supertypes: $ => [
    $.constructor_expression,

    $.data_object,
    $.named_data_object,

    $.general_expression,
    $.iteration_expression,
    $.writable_expression,
    $.arithmetic_expression,
    $.calculation_expression,
    $.string_expression,
    $.itab_line,
    $.itab_comp,
    $.numeric_expression,
    $.character_like_expression,
    $.data_component_selector,
    $.type_component_selector,
    $.relational_expression,
    $._simple_statement,
    $._compound_statement,
    $.pattern,
    $.replace,
  ],

  word: $ => $._name,

  rules: {
    source: $ => repeat($._statement),

    _statement: $ => choice(
      $._simple_statement,
      $._compound_statement,
      $.general_expression,
      $.docstring
    ),

    // Statements that dont have a body.
    _simple_statement: $ => choice(
      $.data_declaration,
      $.types_declaration,
      $.constants_declaration,
      $.message,

      $.assignment,

      $.report_initiator,
      $.deferred_class_definition,
      $.deferred_interface_definition,
      $.local_friends_spec,

      $.class_data_declaration,

      $.function_call,
      $.dynamic_method_call,
      $.subroutine_call,
      $.subroutine_registration,

      $.concatenate,
      $.find,
      $.replace,
      $.shift,
      $.split,
      $.condense,

      // Control flow
      $.raise_statement,
      $.raise_exception_statement,
      $.return_statement,
      $.exit_statement,
      $.check_statement,
      $.continue_statement,
      $.resume_statement,

      $.methods_declaration,
      $.cls_methods_declaration,

      $._empty_statement,
    ),

    // Statements that have a body. As a rule of thumb, that at least encompasses any kind of
    // statement that needs to be terminated with `END[...]` such as `ENDWHILE`, `ENDMETHOD`..
    _compound_statement: $ => choice(
      $.class_definition,
      $.form_definition,
      $.class_implementation,
      $.interface_definition,
      $.interface_implementation,
      $.method_implementation,
      $.if_statement,
      $.case_statement,
      $.type_case_statement,
      $.do_statement,
      $.while_statement,
      $.try_statement
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
      types: $ => $._type_identifier,
      constants: $ => $.identifier
    }),

    _typing: $ => choice(
      $.builtin_type_spec,
      $.referred_type_spec,
      $.ref_type_spec,
      $.table_type_spec,
      $.range_type_spec,
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
      $.ref_expression,
      $.conv_expression,
      $.exact_expression,
      $.cast_expression,
      $.corresponding_expression,
      $.filter_expression,
      $.reduce_expression
    ),

    /**
     * https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENDATA_OBJECTS.html
     */
    data_object: $ => choice(
      $.substring_access,
      $.number,
      $.literal_string,
      $.named_data_object
    ),

    named_data_object: $ => choice(
      $.identifier,
      $.field_symbol,
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

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCALCULATION_EXPRESSION_GLOSRY.html
    calculation_expression: $ => choice(
      $.arithmetic_expression,
      $.string_expression,
      // TOOD: bit expression
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENNUMERICAL_EXPRESSION_GLOSRY.html
    numeric_expression: $ => choice(
      $.identifier,
      $.field_symbol,
      $.number,
      $.data_component_selector,
      $.constructor_expression,
      $.builtin_function_call,
      $.method_call,
      $.table_expression,
      $.arithmetic_expression
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENSTRING_EXPRESSION_POSITIONS.html
    character_like_expression: $ => choice(
      $.data_object,
      $.constructor_expression,
      $.string_expression,
      $.table_expression,
      $.builtin_function_call,
      $.method_call
    ),

    /**
     * A LHS operand that can be written to, can be specified in **write positions**.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENWRITABLE_EXPRESSION_GLOSRY.html
     */
    writable_expression: $ => choice(
      $.new_expression,
      $.cast_expression,
      $.table_expression,
    ),

    /**
     * https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENLOGEXP.html
     */
    logical_expression: $ => choice(
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
    ),

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
      $.predicate_expression,
      $.builtin_function_call,
      $.method_call
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
      field("left", $.character_like_expression),
      field("operator", "&&"), // only possible operator right now.
      field("right", $.character_like_expression)
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

    /**
     * Specification of lines of an internal table with the `BASE` addition, e.g:
     * ... #( BASE itab1 ( field1 = 10 field2 = 20 ) ).
     * 
     * BASE cannot be optional in this secnario as the rule would then clash with 
     * the generic {@link argument_list}. This only serves as a more contextualized
     * sub-rule.
     */
    itab_spec: $ => seq(
      field("base", $.base_spec),
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
      field("iter_var", $.assignment),
      // Optional when `var` is numeric as it will be incremeted implicitly
      optional(
        seq(
          kw("then"),
          field("then", $.general_expression)
        )
      ),
      choice(
        seq(
          kw("until"),
          field("until", $.logical_expression)
        ),
        seq(
          kw("while"),
          field("while", $.logical_expression)
        ),
      ),
      optional(seq($.let_expression, kw("in")))
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENFOR_ITAB.html
    table_iteration: $ => seq(
      kw("for"),

      choice(
        // simple internal table read
        seq(
          field("iterator", $.named_data_object),
          kw("in"),
          field("itab", $.general_expression),
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
      choice(
        // kind of a mess, probably clean this up at some point if we can..
        seq(
          seq(kw("from"), field("from", $.number)),
          optional(seq(kw("to"), field("to", $.number))),
          optional(seq(kw("step"), field("step", $.number))),
        ),
        seq(
          seq(kw("to"), field("to", $.number)),
          optional(seq(kw("step"), field("step", $.number))),
        ),
        seq(kw("step"), field("step", $.number)),
        seq(
          optional(seq(kw("from"), field("from", $.number))),
          optional(seq(kw("to"), field("to", $.number))),
          optional(seq(kw("step"), field("step", $.number))),
          kw("where"),
          choice(
            $.logical_expression,

            // statically specified logical expression log_exp must be placed in parenthese (table iterations)
            // The parantheses here could cause a conflict with logical expressions, so they need a higher precedence.
            prec(2, seq("(", $.logical_expression, ")")),

            // dynamic where clause
            $.dynamic_cond,
            $.dynamic_cond_tab,
          )
        )
      )
    ),

    dynamic_cond: $ => seq(
      "(",
      field("name", $._immediate_identifier),
      token.immediate(")")
    ),

    dynamic_cond_tab: $ => seq(
      "(", "(",
      field("name", $._immediate_identifier),
      token.immediate(")"),
      ")"
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

    _calculation_assignment_operator: _ => choice(
      "+=", "-=", "*=", "/=", "&&="
    ),

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
      $._static_itab_comp,
      $._dynamic_itab_comp,
    ),

    /**
     * Static variant of {@link itab_comp}: `{ comp_name[-sub_comp][{+off(len)}|{->attr}] }`
     */
    _static_itab_comp: $ => choice(
      $.identifier,
      $.struct_component_selector,
      $.object_component_selector,
      $.substring_access,
    ),

    /**
     * Dynamic variant of {@link itab_comp}: `{ (name) }`
     */
    _dynamic_itab_comp: $ => alias($.dynamic_component, $.dynamic_itab_comp),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONSTRUCTOR_EXPRESSION_NEW.html
    new_expression: $ => seq(
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
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONSTRUCTOR_EXPRESSION_VALUE.html 
    value_expression: $ => seq(
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
      optional($._table_expr_default),
      ")",
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

    /**
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONSTRUCTOR_EXPRESSION_CONV.html
     */
    conv_expression: $ => seq(
      kw("conv"),
      field("type", $._constructor_result),
      "(",
      optional(seq($.let_expression, kw("in"))),
      field("dobj", $.general_expression),
      ")"
    ),

    /**
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONSTRUCTOR_EXPRESSION_EXACT.html
     */
    exact_expression: $ => seq(
      kw("exact"),
      field("type", $._constructor_result),
      "(",
      optional(seq($.let_expression, kw("in"))),
      field("dobj", $.general_expression),
      ")"
    ),

    /**
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONSTRUCTOR_EXPRESSION_EXACT.html
     */
    cast_expression: $ => seq(
      kw("cast"),
      field("type", $._constructor_result),
      "(",
      optional(seq($.let_expression, kw("in"))),
      field("dobj", $.general_expression),
      ")"
    ),

    /**
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONSTRUCTOR_EXPRESSION_REF.html
     */
    ref_expression: $ => seq(
      kw("ref"),
      field("type", $._constructor_result),
      "(",
      optional(seq($.let_expression, kw("in"))),
      choice(
        field("dobj", $.data_object),
        field("tab_expr", $.table_expression)
      ),
      optional($._table_expr_default),
      ")"
    ),

    /**
     * Branches into multiple "forms".
     *
     * 1. {@link _corresponding_basic_form}
     * 2. {@link _corresponding_lookup_table_form}
     * 3. TODO: RAP form
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONSTRUCTOR_EXPR_CORRESPONDING.html
     */
    corresponding_expression: $ => seq(
      kw("corresponding"),
      field("type", $._constructor_result),
      "(",
      choice(
        $._corresponding_basic_form,
        $._corresponding_lookup_table_form,
      ),
      ")"
    ),

    /**
     * Basic form of {@link corresponding_expression} as mapping 
     * between two structs / tables
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCORRESPONDING_CONSTR_ARG_TYPE.html
     */
    _corresponding_basic_form: $ => seq(
      optional(kw("exact")),
      // only one of these can occur 
      optional(
        choice(
          alias($._corresponding_base_spec, $.base_spec),
          kw("deep")
        )
      ),
      field("source", $.general_expression),
      optional(seq(...kws("discarding", "duplicates"))),
      optional($.corresponding_mapping_list),
    ),

    /**
     * Lookup table form of {@link corresponding_expression} as a way to 
     * attach data from a lookup table
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCORRESPONDING_CONSTR_USING.html
     */
    _corresponding_lookup_table_form: $ => seq(
      field("itab", $.general_expression),
      kw("from"),
      field("lookup_tab", $.general_expression),
      choice(
        $.using_key_spec,
        kw("using"), // primary key
      ),
      $.lookup_table_mapping_list,
      optional($.corresponding_mapping_list),
    ),

    /**
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCORRESPONDING_CONSTR_MAPPING.html
     */
    corresponding_mapping_list: $ => choice(
      seq(
        kw("mapping"),
        repeat1(
          choice(
            $.corresponding_submapping,
            $.corresponding_mapping
          )
        ),
        optional($.corresponding_exception_list),
      ),
      $.corresponding_exception_list
    ),

    corresponding_submapping: $ => seq(
      "(",
      field("level", $.corresponding_mapping),
      $.corresponding_mapping_list,
      ")"
    ),

    corresponding_mapping: $ => prec.right(
      seq(
        field("left", $.identifier),
        "=",
        choice(
          seq(
            field("right", $.identifier),
            optional(field("default", $._mapping_default))
          ),
          field("default", $._mapping_default)
        ),
        optional(seq(...kws("discarding", "duplicates"))),
      )
    ),

    lookup_table_mapping_list: $ => repeat1($.lookup_table_mapping),

    lookup_table_mapping: $ => seq(
      field("left", $.identifier),
      "=",
      field("right", $.identifier),
    ),

    corresponding_exception_list: $ => seq(
      kw("except"),
      choice(
        "*", // all
        repeat1($.identifier)
      )
    ),

    _mapping_default: $ => seq(
      kw("default"),
      $.general_expression
    ),

    _corresponding_base_spec: $ => seq(
      choice(
        // just the addition base, default..
        kw("base"),
        // if appending is specified, base has the same effect and is optional
        seq(kw("appending"), optional(kw("base"))),
        // the most specific form
        seq(...kws("deep", "appending"), optional(kw("base")))
      ),
      "(",
      field("base", $.data_object),
      ")"
    ),

    /**
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONSTRUCTOR_EXPRESSION_FILTER.html
     */
    filter_expression: $ => seq(
      kw("filter"),
      field("type", $._constructor_result),
      "(",
      field("itab", $.general_expression),
      optional(kw("except")),

      optional($.using_key_spec),
      optional($.filter_tab_spec),

      kw("where"),
      $.logical_expression,
      ")"
    ),

    filter_tab_spec: $ => seq(
      kw("in"),
      field("ftab", $.general_expression), // functional operand position?
      optional($.using_key_spec),
    ),

    /**
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONSTRUCTOR_EXPRESSION_REDUCE.html
     */
    reduce_expression: $ => seq(
      kw("reduce"),
      field("type", $._constructor_result),
      "(",
      optional(seq($.let_expression, kw("in"))),
      $.reduce_init,
      repeat1($.iteration_expression),
      $.reduce_next,
      ")"
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPLET.html
    let_expression: $ => seq(
      kw("let"),
      repeat1($.assignment)
    ),

    /**
     * INIT part of a {@link reduce_expression}
     */
    reduce_init: $ => seq(
      kw("init"),
      repeat1($.init_spec)
    ),

    /**
     * NEXT part of a {@link reduce_expression}
     */
    reduce_next: $ => seq(
      kw("next"),
      repeat1($.assignment)
    ),

    /**
     * Cant use a simple {@link assignment} for this because its
     * possible to declare initial values and specify a type for them.
     * 
     * TODO: Conflict with {@link assignment} rule if used in a choice,
     * figure that out, would be nice to reuse that part at least and
     * just add a choice for the data declaration.
     */
    init_spec: $ => seq(
      field("name", choice($.identifier, $.field_symbol)),
      choice(
        seq(
          "=",
          field("value", $.general_expression)
        ),
        field("typing", $._typing)
      ),
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

    /**
     * Modifiers for the evaluation of {@link table_expression} inside 
     * {@link value_expression} and {@link ref_expression}.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENTABLE_EXP_OPTIONAL_DEFAULT.html
     */
    _table_expr_default: $ => choice(
      kw("optional"),
      seq(
        kw("default"),
        field("default", $.general_expression)
      )
    ),

    /**
     * THROW exception addition of {@link cond_expression}, {@link switch_expression}
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONDITIONAL_EXPRESSION_RESULT.html
     */
    throw_exception: $ => seq(
      kw("throw"),
      optional(kw("resumable")),
      optional(kw("shortdump")),
      field("name", $._type_identifier),
      "(",
      optional($._inline_message_spec),
      ")"
    ),

    /**
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPRAISE_EXCEPTION_CLASS.html 
     */
    raise_exception_statement: $ => prec.right(seq(
      kw("raise"),
      optional(kw("resumable")),
      kw("exception"),
      choice(
        field("oref", $.general_expression),
        seq(
          kw("type"),
          field("name", $.identifier),
          optional(
            choice(
              seq(...kws("using", "message")),
              // For some reason 'using message' went missing from the docs, but it
              // just uses the system message fields (sy-msgid, etc..)
              // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPRAISE_EXCEPTION_MESSAGE.html
              $._inline_message_spec,
            )
          ),
          optional(args("exporting", $._named_argument_list))
        )
      )
    )),

    /**
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPRAISE_EXCEPTION.html
     */
    raise_statement: $ => seq(
      kw("raise"),
      field("name", $.identifier)
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPRETURN.html
    return_statement: $ => seq(
      kw("return"),
      optional(field("expr", $.general_expression)),
      "."
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPEXIT_PROCESSING_BLOCKS.html
    exit_statement: _ => seq(
      kw("exit"),
      "."
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCHECK_PROCESSING_BLOCKS.html
    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCHECK_LOOP.html
    check_statement: $ => seq(
      kw("check"),
      field("condition", $.logical_expression),
      "."
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCONTINUE.html
    continue_statement: _ => seq(kw("continue"), "."),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPRESUME.html
    resume_statement: _ => seq(kw("resume"), "."),

    /**
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abapmessage.html
     */
    message: $ => seq(
      kw("message"),
      choice(
        seq(":", commaSep1($.message_spec)),
        $.message_spec
      ),
      "."
    ),

    /**
     * A message specification that is inlined into another statement, e.g
     * a {@link throw_exception} or {@link raise_exception} and preceded by
     * a 'message' keyword that doesnt technically serve as a declaration.
     */
    _inline_message_spec: $ => seq(
      kw("message"),
      $.message_spec
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
     * 
     * CAUTION: MESSAGE oref | text have identical syntax and are ambiguous.
     */
    message_spec: $ => prec.right(2,
      seq(
        choice(
          $._compact_message_id,
          $._long_form_message_id,
          // message from an exception object or character-like data object
          seq(
            choice(
              field("text", $.literal_string),
              field("source", $.character_like_expression)
            ),
            optional($._message_type_spec)
          ),
        ),
        repeat(
          choice(
            field("display", $._message_display_override),
            field("arguments", $.message_arguments),
            seq(
              kw("into"),
              field("into", choice(
                $.named_data_object,
                $.declaration_expression
              ))
            ),
            seq(kw("raising"), field("raising", $.identifier)),
          )
        ),
      )
    ),

    /**
     * Compact specification of a message type, number and optionally, the ID.
     * 
     * For example, i333(zmessages) represents message Nr. 333 as type 'I' of
     * message class zmessages, where the message class id can be omitted if
     * its already set at a program level.
     */
    _compact_message_id: $ => seq(
      // could not find a way to do this without help from an
      // external scanner due to how grouping into word tokens
      // behaves during lexing.
      field("type", $.message_type),
      field("number", $._immediate_number),

      // Optional if specified at program level
      optional(
        seq(
          token.immediate("("),
          field("id", $._immediate_identifier),
          token.immediate(")"),
        )
      )
    ),

    /**
     * Long form specification of a message type, number and ID where each
     * can also be specified dynamically through the value of a data object.
     */
    _long_form_message_id: $ => seq(
      kw("id"),
      field("id", $.data_object),

      // Not technically optional, but theres not really any ambiguity in
      // this context and it makes highlighting smoother..
      optional($._message_type_spec),
      optional(
        seq(
          kw("number"),
          field("number", $.data_object),
        )
      )
    ),

    _message_type_spec: $ => seq(
      kw("type"),
      field("type", $.data_object)
    ),

    message_arguments: $ => seq(
      kw("with"), prec.right(repeat1($.general_expression))
    ),

    _message_display_override: $ => seq(
      seq(
        ...kws("display", "like"),
        field("display_type", $.data_object)
      )
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
      optional(kw("no-gaps")),
      "."
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSPLIT.html
    split: $ => seq(
      kw("split"),
      field("dobj", $.character_like_expression),
      $.separator_spec,
      $.into_clause,
      optional($.string_processing_spec),
      "."
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSHIFT.html
    shift: $ => seq(
      kw("shift"),
      field("dobj", $.data_object),
      optional(

        choice(
          // ... {[places][direction]} ...
          seq(
            choice(
              $.shift_by_places_spec,
              $.shift_to_substring_spec,
              $.shift_direction_spec
            ),
            optional($.shift_direction_spec)
          ),
          // ... / deleting ...
          choice(
            $.shift_left_deleting_spec,
            $.shift_right_deleting_spec
          )
        ),
      ),
      optional($.string_processing_spec),
      "."
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSHIFT_PLACES.html
    shift_by_places_spec: $ => seq(
      kw("by"),
      field("num", $.numeric_expression),
      kw("places"),
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSHIFT_PLACES.html
    shift_to_substring_spec: $ => seq(
      ...kws("up", "to"),
      field("substring", $.character_like_expression),
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSHIFT_DIRECTION.html
    shift_direction_spec: _ => prec.right(
      repeat1(
        choice(
          field("direction", choice(...kws("left", "right"))),
          field("circular", kw("circular"))
        )
      )
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSHIFT_DELETING.html
    shift_left_deleting_spec: $ => seq(
      ...kws("left", "deleting", "leading"),
      field("mask", $.character_like_expression)
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSHIFT_DELETING.html
    shift_right_deleting_spec: $ => seq(
      ...kws("right", "deleting", "trailing"),
      field("mask", $.character_like_expression)
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPFIND.html
    find: $ => seq(
      kw("find"),
      optional($.occurrence_spec),
      $.pattern,
      kw("in"),
      optional($.section),
      field("dobj", $.character_like_expression),
      optional($.string_processing_spec),
      optional($.find_options),
      "."
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
      optional($.replace_options),
      "."
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPREPLACE_IN_POSITION.html
    position_based_replacement: $ => seq(
      kw("replace"),
      optional($.section),
      field("dobj", $.data_object),
      kw("with"),
      field("new", $.data_object),
      optional($.string_processing_spec),
      "."
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
      field("sep", $.character_like_expression)
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
      $._type_identifier // explicit
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
     * The documentation is lacking as to what an assignment should be considered. In theory, it
     * can make up a full statement on its own. However, it can also be specified in operand 
     * positions and act as an expression, that is why e.g multiple assignments are possible:
     * ```
     * foo = bar = baz.
     * ```
     * 
     * The big question is how general to make the rule in order to allow it to work in various
     * places without fighting over precedence / conflicts.
     * 
     * See: https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENVALUE_ASSIGNMENTS.html
     */
    assignment: $ => prec.right(
      seq(
        field("left",
          choice(
            $.data_object,
            $.declaration_expression,
            $.writable_expression,
          )
        ),
        // for a regular assignment '=', the right side could be another
        // assignment or a declaration expression, this doesnt make sense
        // for calculation assignments using +=, *=, etc..
        choice(
          seq(
            field("operator", "="),
            field("right",
              choice(
                $.general_expression,
                $.declaration_expression,
                $.assignment
              )
            ),
          ),
          seq(
            field("operator", $._calculation_assignment_operator),
            field("right",
              choice(
                $.general_expression,
              )
            ),
          ),
        ),
        optional(".")
      )
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
              $.new_expression,
              $.cast_expression
            ),
            token.immediate("->")
          ),
        ),
      ),
      field("name", $._immediate_identifier),
      $._parenthesized_call_arguments
    )),

    /**
     * Dynamic variant of a {@link method_call}
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCALL_METHOD_METH_IDENT_DYNA.html
     */
    dynamic_method_call: $ => seq(
      ...kws("call", "method"),
      field("method", $.dynamic_method_spec),
      optional($.call_argument_list),
      "."
    ),

    dynamic_method_spec: $ => choice(
      $.identifier,
      $.dyn_spec,
      $.object_component_selector,
      $.class_component_selector,
    ),

    subroutine_call: $ => seq(
      kw("perform"),
      field("routine", $.subroutine_spec),
      repeat(
        choice(
          args("tables", $._positional_argument_list),
          args("using", $._positional_argument_list),
          args("changing", $._positional_argument_list)
        )
      ),
      "."
    ),

    subroutine_registration: $ => seq(
      kw("perform"),
      field("name", $.identifier),
      choice(
        seq(...kws("on", "rollback")),
        seq(
          ...kws("on", "commit"),
          optional(seq(
            kw("level"),
            field("level", $.data_object)
          ))
        )
      ),
      "."
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPPERFORM_FORM.html
    subroutine_spec: $ => choice(
      field("name", $.identifier),
      seq(
        field("name", $.identifier),
        field("program", alias($._immediate_dyn_spec, $.dyn_spec)),
        optional(seq(...kws("if", "found")))
      ),
      seq(
        field("name", choice(
          $.identifier,
          $.dyn_spec
        )),
        ...kws("in", "program"),
        field("program", choice(
          $.identifier,
          $.dyn_spec
        )),
        optional(seq(...kws("if", "found")))
      ),
      seq(
        field("index", $.data_object),
        kw("of"),
        $.subroutine_list
      )
    ),

    subroutine_list: $ => repeat1($.identifier),

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
      $._parenthesized_call_arguments,
    ),

    /**
     * Call of a function module using CALL FUNCTION
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCALL_FUNCTION.html
     */
    function_call: $ => seq(
      ...kws("call", "function"),
      field("name", $.character_like_expression),
      repeat(
        choice(
          $._sync_rfc_destination_spec,
          $._sync_rfc_session_spec,
          $._async_rfc_task_spec,
          $._async_rfc_callback_spec,
          $._bg_rfc_unit_spec,
          $._update_task_spec,
          $._transactional_rfc_spec
        )
      ),
      optional($.call_argument_list),
      "."
    ),

    _sync_rfc_destination_spec: $ => seq(
      kw("destination"),
      choice(
        field("destination", $.data_object),
        seq(
          ...kws("in", "group"),
          field("group", choice(
            $.named_data_object,
            kw("default")
          ))
        )
      )
    ),

    _sync_rfc_session_spec: $ => seq(
      ...kws("in", "remote", "session"),
      field("session", $.named_data_object)
    ),

    _async_rfc_task_spec: $ => seq(
      ...kws("starting", "new", "task"),
      field("task_id", $.data_object)
    ),

    _async_rfc_callback_spec: $ => seq(
      choice(
        seq(
          kw("calling"),
          field("callback_method", choice(
            $.identifier,
            $.object_component_selector,
            $.class_component_selector
          ))
        ),
        seq(
          kw("performing"),
          field("callback_routine", $.identifier)
        )
      ),
      ...kws("on", "end", "of", "task")
    ),

    _bg_rfc_unit_spec: $ => seq(
      ...kws("in", "background", "unit"),
      field("background_unit", $.named_data_object)
    ),

    /**
     * Despite being an obsolete language element, this is still used quite often.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCALL_FUNCTION_BACKGROUND_TASK.html
     */
    _transactional_rfc_spec: $ => prec.right(seq(
      ...kws("in", "background", "task"),
      optional(seq(...kws("as", "separate", "unit"))),
      optional(seq(
        kw("destination"),
        field("destination", $.data_object)
      ))
    )),

    _update_task_spec: _ => seq(
      ...kws("in", "update", "task"),
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCALL_METHOD_PARAMETERS.html
    call_arguments: $ => seq(
      token.immediate("("),

      // avoid ambiguity, if theres no whitespace here it likely isnt a call.
      token.immediate(/[\t\n\r ]/),

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
        repeat1($.positional_argument)
      )
    ),

    _parenthesized_call_arguments: $ => seq(
      token.immediate("("),
      token.immediate(/[\t\n\r ]/),
      optional($.call_argument_list),
      ")",
    ),

    /**
     * The argument list of e.g a {@link method_call} or {@link function_call}, but also
     * used for things such as implicit class initialization of {@link raise_exception}.
     * 
     * The difference between this and a generic {@link argument_list} is that no let
     * expression is possible and only {@link named_argument} can be specified.
     */
    call_argument_list: $ => choice(
      repeat1(
        choice(
          $._importing_args,
          $._exporting_args,
          $._changing_args,
          $._receiving_args,
          $._tables_args,
          $._parameter_table_args,
          $._exception_table_args,
          $._tables_args,
          $._exceptions_args,
        )
      ),
      // In method calls, if the parameter is not preceded by the parameter type,
      // its always exporting. Only one positional argument or any number of
      // named arguments may follow.
      field("exporting", choice(
        $._named_argument_list,
        $.positional_argument
      )),
    ),

    _importing_args: $ => args("importing", $._named_argument_list),
    _exporting_args: $ => args("exporting", $._named_argument_list),
    _changing_args: $ => args("changing", $._named_argument_list),
    _receiving_args: $ => args("receiving", $._named_argument_list),
    _tables_args: $ => args("tables", $._named_argument_list),
    _exceptions_args: $ => args("exceptions", $._exception_mapping_list),
    _parameter_table_args: $ => args("parameter-table", $.named_data_object),
    _exception_table_args: $ => args("exception-table", $.named_data_object),

    /**
     * An argument list where only named arguments can occur. This is needed
     * in statements such as {@link raise_exception} because positional args
     * are impossible in that position and cause parser conflicts.
     */
    _named_argument_list: $ => prec.right(
      alias(repeat1($.named_argument), $.argument_list)
    ),

    named_argument: $ => seq(
      field("name",
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

    /**
     * An argument list where only positional arguments can occur.
     * Required for calls to a form using {@link subroutine_call}.
     */
    _positional_argument_list: $ => prec.right(
      alias(repeat1($.positional_argument), $.argument_list)
    ),

    positional_argument: $ => field("value", $.general_expression),

    /**
     * Type based on elementary types. Only here are `length` and `decimals` additions allowed.
     * 
     * While part of this statement is optional, tree sitter doesnt allow empty rules,
     * so we kind of have to list possible combinations (in order).
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDATA_SIMPLE.html
     */
    builtin_type_spec: $ => prec.right(choice(
      // Optional Buff size + type + optional type meta
      seq(optional(BUFF_SIZE($)), seq(kw("type"), field("name", alias(ABAP_TYPE, $.type_identifier))), repeat($._type_meta)),
      // Optional buff size + required type meta
      seq(optional(BUFF_SIZE($)), repeat1($._type_meta)),
      // Only buf size
      BUFF_SIZE($)
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
    referred_type_spec: $ => prec.right(seq(
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

    /**
     * Internal Table type declaration.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDATA_ITAB.html
     */
    table_type_spec: $ => prec.right(seq(
      choice(
        seq(
          kw("type"),
          field("kind", $._table_category),
          kw("table")
        ),
        // the 'modern' way
        seq(
          typeOrLikeExpr($,
            seq(
              optional(field("kind", $._table_category)),
              ...kws("table", "of"),
            ),
            alias($._inline_ref_type_spec, $.ref_type_spec)
          ),
          optional($.keys)
        ),
        // obsolete way
        seq(
          optional(BUFF_SIZE($)),
          kw("occurs"),
          field("occurs", $.number)
        )
      ),
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
    range_type_spec: $ => prec.right(seq(
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
    ref_type_spec: $ => prec.right(seq(
      typeOrLikeExpr($, seq(...kws("ref", "to"))),

      // Not technically valid for types declarations but intentionally tolerated.
      repeat(choice(
        seq(...kws("value", "is", "initial")),
        seq(...kws("read-only"))
      ))
    )),

    /**
     * Only the `ref to xyz` part of a reference type specification to
     * be inlined into other type specifications such as {@link table_type_spec}
     */
    _inline_ref_type_spec: $ => seq(
      ...kws("ref", "to"),
      choice(
        $._type_identifier,
        $.type_component_selector
      )
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPTYPES_KEYDEF.html
    keys: $ => prec.right(repeat1($.table_key_spec)),

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
      field("friend", repeat1($.identifier)),
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
        seq(":", commaSep1(choice($.method_spec, $.constructor_spec))),
        choice($.method_spec, $.constructor_spec)
      ),
      "."
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLASS-METHODS.html
    cls_methods_declaration: $ => seq(
      kw("class-methods"),
      choice(
        seq(":", commaSep1(choice($.method_spec, $.constructor_spec))),
        choice($.method_spec, $.constructor_spec)
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
      field("name", $.identifier),
      optional($._method_signature)
    ),

    constructor_spec: $ => seq(
      choice(...kws("constructor", "class_constructor")),
      optional($._method_signature)
    ),

    _method_signature: $ => repeat1(
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
      field("name", $.identifier),
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

    _form_parameter_list: $ => alias(seq(
      repeat1(alias($._form_parameter, $.parameter)),
    ), $.parameter_list),

    preferred_parameter: $ => seq(
      ...kws("preferred", "parameter"),
      field("name", $.identifier)
    ),

    raising_list: $ => repeat1($.exception),
    exception_list: $ => repeat1($.identifier),

    _exception_mapping_list: $ => alias(repeat1($.exception_mapping), $.argument_list),

    exception_mapping: $ => seq(
      field("name", $.identifier),
      "=",
      field("value", $.number),
      optional(seq(
        kw("message"),
        field("message", $.named_data_object)
      ))
    ),

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
      optional(
        choice(
          kw("optional"),
          seq(
            kw("default"),
            field("default", choice(
              $.identifier, // constant
              $.number,
              $.literal_string
            ))
          )
        ))
    )),

    _form_parameter: $ => prec.right(seq(
      choice(
        seq(
          optional("!"),
          field("name", $.identifier),
        ),
        seq(
          kw("value"),
          token.immediate("("),
          field("name", $._immediate_identifier),
          token.immediate(")")
        ),
      ),
      optional(
        choice(
          field("typing", $._typing),
          seq(kw("structure"), field("structure", $.identifier))
        )
      )
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

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPIF.html
    if_statement: $ => seq(
      kw("if"),
      field("condition", $.logical_expression), ".",
      field("consequence", optional($.statement_block)),

      repeat(field("alternative", $.elseif_clause)),
      optional(field("alternative", $.else_clause)),

      kw("endif"), "."
    ),

    elseif_clause: $ => seq(
      kw("elseif"),
      field("condition", $.logical_expression),
      ".",
      field("consequence", optional($.statement_block)),
    ),

    else_clause: $ => seq(
      kw("else"),
      ".",
      field("consequence", optional($.statement_block)),
    ),

    /**
     * TODO: Add tests
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCASE.html
     */
    case_statement: $ => seq(
      kw("case"),
      field("subject", $.general_expression),
      ".",
      repeat(field("alternative", $.case_clause)),
      kw("endcase"), "."
    ),

    case_clause: $ => seq(
      kw("when"),
      choice(
        kw("others"),
        field("condition", $.case_operand_list),
      ),
      ".",
      field("consequence", optional($.statement_block)),
    ),

    case_operand_list: $ => seq(
      $._case_operand,
      repeat(
        seq(
          kw("or"),
          $._case_operand,
        )
      )
    ),

    /**
     * TODO: Add tests
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCASE_TYPE.html
     */
    type_case_statement: $ => seq(
      ...kws("case", "type", "of"),
      field("subject", $.general_expression),
      ".",
      repeat(field("alternative", $.type_case_clause)),
      kw("endcase"), "."
    ),

    type_case_clause: $ => seq(
      kw("when"),
      choice(
        kw("others"),
        seq(
          kw("type"),
          field("condition", $._type_identifier),
          optional(
            seq(
              kw("into"),
              field("target",
                choice(
                  $.named_data_object,
                  $.declaration_expression
                )
              )
            )
          ),
        ),
      ),
      ".",
      field("consequence", optional($.statement_block)),
    ),

    /**
     * These are 'extended functional positions' and considered obsolete
     * 
     * See https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENEXTENDED_FUNCTIONAL_POSITIONS.html
     */
    _case_operand: $ => choice(
      $.data_object,
      $.builtin_function_call,
      $.constructor_expression,
      $.method_call
    ),

    /**
     * TODO: Add tests
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDO.html
     */
    do_statement: $ => seq(
      kw("do"),
      optional(
        seq(
          field("repetitions", $.numeric_expression),
          kw("times")
        )
      ),
      ".",
      optional(field("body", $.statement_block)),
      kw("enddo"), "."
    ),

    /**
     * TODO: Add tests
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPWHILE.html
     */
    while_statement: $ => seq(
      kw("while"),
      field("condition", $.logical_expression),
      ".",
      optional(field("body", $.statement_block)),
      kw("endwhile"),
      "."
    ),

    /**
     * TODO: Add tests
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPTRY.html
     */
    try_statement: $ => seq(
      kw("try"),
      ".",
      optional(field("body", alias($.statement_block, $.try_block))),
      repeat($.catch_clause),
      optional($.cleanup_clause),
      kw("endtry"),
      "."
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCATCH_TRY.html
    catch_clause: $ => seq(
      kw("catch"),
      optional(seq(...kws("before", "unwind"))),
      field("exceptions", alias($.exception_list, $.catch_exception_list)),
      optional(
        seq(
          kw("into"),
          field("into", choice(
            $.named_data_object,
            $.declaration_expression
          ))
        ),
      ),
      ".",
      optional(field("body", alias($.statement_block, $.catch_block))),
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCLEANUP.html
    cleanup_clause: $ => seq(
      kw("cleanup"),
      optional(
        seq(
          kw("into"),
          field("into", choice(
            $.named_data_object,
            $.declaration_expression
          ))
        ),
      ),
      ".",
      optional(field("body", alias($.statement_block, $.cleanup_block))),
    ),

    /**
     * Technically obsolete but still used excessively.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPFORM.html 
     */
    form_definition: $ => seq(
      kw("form"),
      field("name", $.identifier),
      repeat(
        choice(
          params("tables", $._form_parameter_list),
          params("using", $._form_parameter_list),
          params("changing", $._form_parameter_list),
          params("raising", $.raising_list),
        )
      ),
      ".",
      optional(field("body", alias($.statement_block, $.form_body))),
      kw("endform"),
      "."
    ),

    statement_block: $ => repeat1($._statement),

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
                field("name", alias(kw("primary_key"), $.identifier)),
                optional(seq(kw("alias"), field("alias", $.identifier))),
                kw("components")
              )
            ),
            field("components", $.key_components)
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
      kw("components"), field("components", $.key_components)

    ),

    key_components: $ => prec.right(repeat1($.identifier)),

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
    // TODO: Do we need an immediate variant of this for dyn specs?
    data_component_selector: $ => choice(
      $.struct_component_selector,
      $.object_component_selector,
      $.class_component_selector,
      $.interface_component_selector,
      $.dereference
    ),

    // A component selector superclass that can return a type
    type_component_selector: $ => choice(
      alias($._struct_component_type_selector, $.struct_component_selector),
      alias($._class_component_type_selector, $.class_component_selector),
      // I dont think it is possible to get to a type through an interface component?
      // That would imply types are accessibly through properties, which they shouldnt be.
      // A dereference cant result in a type, so no need to copy that.
    ),

    dynamic_component: $ => seq(
      "(",
      choice(
        field("name", choice(
          $._immediate_identifier,
          $._immediate_literal_string,
        )),
        field("offset", $._immediate_number),
      ),
      token.immediate(")")
    ),

    _immediate_dyn_spec: $ => seq(
      token.immediate("("),
      field("name", choice(
        $._immediate_identifier,
        $._immediate_literal_string
      )),
      token.immediate(")")
    ),

    dyn_spec: $ => seq(
      "(",
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
          $._immediate_identifier
        )
      )
    ),

    /**
     * The type identifier variant of {@link struct_component_selector}
     * 
     * The dynamic path can be stripped since its not allowed for typing.
     */
    _struct_component_type_selector: $ => seq(
      field("struct",
        choice(
          $._type_identifier,
          $.type_component_selector,
        )
      ),
      token.immediate("-"),
      field("comp", $._type_identifier)
    ),

    /**
     * Accesses a component `comp` of an object
     * 
     * `ref->comp` or `ref->(comp)`
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENOBJECT_COMPONENT_SELECTOR.html
     */
    object_component_selector: $ => seq(
      field("ref",
        choice(
          $.identifier,
          $.data_component_selector,
          $.method_call,
          $.new_expression,
          $.table_expression,
          $.cast_expression,
        )
      ),
      token.immediate("->"),
      field("comp",
        choice(
          $.dynamic_component,
          $._immediate_identifier
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
      field("class", choice(
        $.identifier,
        $.dyn_spec
      )),
      token.immediate("=>"),
      field("comp",
        choice(
          $.dyn_spec,
          $._immediate_identifier
        )
      )
    ),

    _class_component_type_selector: $ => seq(
      field("class", $.identifier),
      token.immediate("=>"),
      field("comp", $._immediate_type_identifier)
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
          $.table_expression,
          $.cast_expression
        )
      ),
      token.immediate("->*"),
    ),

    /**
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENOFFSET_LENGTH.html
     */
    substring_access: $ => prec.right(1,
      seq(
        field("target", choice(
          $.identifier,
          $.data_component_selector,
          $.dereference,
          $.field_symbol
        )),
        choice(
          $._substring_length,
          seq(
            $._substring_offset,
            optional($._substring_length)
          ),
        )
      )
    ),

    _substring_offset: $ => seq(
      token.immediate("+"),
      field("offset",
        choice(
          $._immediate_number,
          $._immediate_identifier
        )
      )
    ),

    _substring_length: $ => seq(
      token.immediate("("),
      field("length",
        choice(
          $._immediate_number,
          $._immediate_identifier
        )
      ),
      token.immediate(")"),
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
      alias(/[^\n\r]*/, $.code)
    )),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENPRAGMA.html
    pragma: $ => seq(
      '##',
      alias(token.immediate(/[^\n\r#. ]+/), $.code),
      // Up to 2 parameters are possible, but extras dont allow optionals.
      // While this hack does work fine, it unfortunately causes the parameter nodes
      // to always show up in the tree even when no parameter are specified.
      // So im not sure if I want to have it that way.
      // /\[?/, alias(token.immediate(/[^\n\r\]]*/), $.param), /\]?/,
      // /\[?/, alias(token.immediate(/[^\n\r\]]*/), $.param), /\]?/,
    ),

    /**
     * Docstring (modern abap). Due to the more complex nature of its syntx, its not 
     * 'extra-compatible'. However, since it typically doesnt occur inlined, its trivially
     * checked for in the possible positions.
     * 
     * While HTML is allowed in the docstrings, theres not really any reason for us to
     * actually parse said html to produce anything meaningful. The main thing we care about
     * is the non-html features such as linking other components or listing parameters, etc.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENDOCCOMMENT.html
     * 
     * The special characters ", ', <, >, @, {, |, and } can, if necessary, be escaped 
     * using &quot;, &apos;, &lt;, &gt;, &#64;, &#123;, &#124;, and &#125;.
     */
    docstring: $ => seq(
      // first line
      "\"!",
      optional($._docstring_content),
      // subsequent lines need special external continuation handling
      repeat(
        seq(
          alias($._docstring_continuation, "\"!"),
          optional($._docstring_content)
        )
      ),
    ),

    _docstring_content: $ => seq(
      // for both options, its best to just preconsume any leading whitespaces
      // to get a cleaner result. Otherwise, something like ` @parameter` could get
      // captured instead..
      /[ \t]*/,
      optional(
        choice(
          $.doctag,
          $.paragraph,
        )
      )
    ),

    /**
     * A paragraph of documentation, within a single line of the docstring.
     * 
     * Example:
     * ```
     * This method provides an instance of {@link cl_abap_browser} for use.
     * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ ----------------------  ^^^^^^^
     *        text                              doclink             text
     * ```
     * If the paragraph is continued in the next line of the docstring, it will
     * be a seperate node. This is due to the intention to avoid making the `"!"`
     * line start part of the paragraph, which it technically isnt.
     */
    paragraph: $ => repeat1(
      choice(
        // since a @ only starts a doctag at the beginning of the line,
        // we really just need to make sure the line doesnt start with it.
        // Also make sure to allow '{' and '}' when escaped
        token.immediate(/(?:\\[{}]|[^@{}\n\r])(?:\\[{}]|[^{}\n\r])*/),
        $.doclink,
      )
    ),

    doctag: $ => choice(
      // Defined tags: @parameter, @raising, @exception
      seq(
        field("tag", alias(token(/@(parameter|raising|exception)/), $.tag)),
        field("name", $.identifier),
        token.immediate(/[ \t]+[\|]*[ \t]*/),
        optional(field("documentation", $.paragraph))
      ),
      // Custom tags, not technically a thing but might as well?.. always wanted this :D
      seq(
        field("tag", alias(token(/@[a-zA-Z]+/), $.tag)),
        optional(field("documentation", $.paragraph))
      )
    ),

    /**
     * In an ABAP Doc comment, the following syntax can be used to refer to 
     * the documentation of other repository objects:
     * 
     * {@link [[[kind:]name.]...][kind:]name} ...
     */
    doclink: $ => seq(
      token.immediate("{"),
      "@link",
      $.linked_object_path,
      "}",
    ),

    linked_object_path: $ => prec.right(choice(
      field("locator", $.linked_node),
      seq(
        choice(
          seq(
            field("locator", choice(
              $.linked_object_path,
              $.linked_node,
            )),
            ".",
          ),
          field("locator", $.scope_directive)
        ),
        field("comp", $.linked_node)
      )
    )),

    linked_node: $ => seq(
      optional(
        seq(
          field("kind", $.linked_object_kind),
          token.immediate(':'),
        )
      ),
      field("name", $.identifier)
    ),

    scope_directive: _ => prec.left(repeat1(".")),

    linked_object_kind: _ => choice(...caseInsensitiveAliased(
      "data", // constants, variables, procedure parameters
      "doma", // ddic domains
      "evnt", // class based events
      "func", // function modules in function pools
      "form", // subroutines in programs
      "fugr", // function pools
      "intf", // interfaces implemented in a class
      "meth", // methods
      "prog", // abap programs
      "seam", // test seams
      "xslt"  // xslt programs and simple transformations
    )),

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

    _name: _ => IDENTIFIER_REGEX,

    identifier: $ => choice($._name, $._contextual_keyword),

    /**
     * ABAP does not reserve keywords whatsoever. Any keyword is valid to be used as an identifier.
     * 
     * Why dont we just add all keywords to this list then? Because tree-sitter performs context-aware
     * parsing, meaning it will only consider the keywords in a position where they could appear based on
     * the grammars structure. For example, an "endclass" keyword wouldnt cause ambiguity because it can
     * only appear in a very specific position, unlike keywords that introduce a {@link general_expression}.
     * 
     * Consider the following code:
     * 
     * ceil( value i( 10 )).
     * 
     * The builtin function could receive either a {@link named_argument} or a {@link positional_argument}
     * so during lexical analysis, the parser considers that the word could either be a `value` 
     * keyword or a `value` identifier. The keyword ends up taking higher lexical precendence (as it should)
     * and as a result, the branch containing the identifier rule is never even considered during parsing.
     * 
     * The only way to resolve this is to make sure that the other branch doesnt get dropped, so both
     * can be explored and the contextually correct one is chosen. For this reason, the keywords must
     * be added to the {@link identifier} rule as well and aliased to an identifier. Do however make sure
     * that they have a lower precedence to express: 
     * If theres a keyword valid in that context, use that. Else consider the keyword to be an identifier.
     * 
     * Great for testing this once more keywords are added: https://www.abapforum.com/forum/viewtopic.php?p=21654
     */
    _contextual_keyword: _ => prec(-1, choice(
      ...caseInsensitive(
        "value",
        "new",
        "cond",
        "switch",
        "cast",
        "class",
        "conv",
        "ref",
        "any",
        "filter",
        "data"
      )
    )),

    field_symbol: $ => seq(
      '<',
      field("name", $._immediate_identifier),
      token.immediate(">")
    ),

    _type_identifier: $ => alias($.identifier, $.type_identifier),

    _immediate_identifier: $ => alias(token.immediate(IDENTIFIER_REGEX), $.identifier),

    _immediate_type_identifier: $ => alias(token.immediate(IDENTIFIER_REGEX), $.type_identifier),

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

  }
});

function caseInsensitive(...terms) {
  return terms.map((t) => new RustRegex(t
    .split('')
    .map(l => l !== l.toUpperCase() ? `[${l}${l.toUpperCase()}]` : l)
    .join('')
  ));
}

function caseInsensitiveAliased(...terms) {
  return terms.map(t => alias(caseInsensitive(t).shift(), t))
}

function kw(keyword) { return caseInsensitiveAliased(keyword).shift() };
function kws(...keywords) { return caseInsensitiveAliased(...keywords) }

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
       * keyword inside a `data:` block, but it is such a niche scenario worth keeping the grammar simpler over.
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
function typeOrLikeExpr($, addition, ...extraChoices) {
  return choice(
    seq(
      kw("type"),
      addition,
      field("name", choice(
        $._type_identifier,
        $.type_component_selector,
        ...extraChoices
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
  return field(keyword.replace("-", "_"), seq(kw(keyword), rule));
}
