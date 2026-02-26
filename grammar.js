const gen = require("./grammar/core/generators.js")
const fs = require('fs');
const path = require('path');

/**
 * @file Abap grammar for tree-sitter
 * @author Kendrick Hommel <kendrick.hommel@gmail.com>
 * @license MIT
 */

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
    // A single full-line comment, only external scanner can do column check
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

  conflicts: $ => [
    // ... FROM 1 TO 5 STEP 2 TO itab <<< conflict at 'TO <dobj>'
    [$.lines_of],
    // ... SORT itab BY (var) <<< is var a dynamic itab component spec or an order table spec???
    [$.dyn_spec, $.dynamic_component]
  ],

  extras: $ => [
    $.line_comment,
    $.inline_comment,
    $.pseudo_comment,
    $.pragma,
    $.multi_line_comment,

    // THIS MUST BE A REGEX! Putting it inside a rule or the external scanner causes
    // token.immediate() to not enforce the absence of whitespaces. In return, that
    // causes some complications inside the external scanner (explained there).
    /\s/,
  ],

  supertypes: $ => [
    $.simple_statement,
    $.reserved_statement,

    $.constructor_expression,

    $.data_object,
    $.named_data_object,

    $.general_expression,
    $.functional_expression,
    $.iteration_expression,
    $.writable_expression,
    $.arithmetic_expression,
    $.calculation_expression,
    $.receiving_expression,
    $.string_expression,
    $.itab_line,
    $.itab_comp,
    $.numeric_expression,
    $.character_like_expression,
    $.data_component_selector,
    $.type_component_selector,
    $.relational_expression,
  ],

  word: $ => $._name,

  rules: {
    source: $ => {
      // Required for aliasing rules in the generators.
      gen.state.grammarProxy = $;

      return repeat(
        choice(
          $.general_expression,
          $.simple_statement,
          $.reserved_statement,
          $.docstring
        )
      );
    },

    /**
     * A statement that may appear anywhere in the code. This doesnt necessarily
     * mean it needs to be valid or meaningful in the current position, but it
     * excludes things such as event processing blocks or class declarations,
     * which is needed e.g because the start of such an event block may terminate
     * another rather than becoming part of it.
     */
    simple_statement: $ => choice(
      // Fundamental declarations
      $.data_declaration,
      $.types_declaration,
      $.constants_declaration,

      // ???
      $.message,
      $.assignment,

      // Processing statements
      $.function_call,
      $.dynamic_method_call,
      $.local_updates_statement,
      $.commit_work_statement,
      $.rollback_work_statement,
      $.concatenate_statement,
      $.condense_statement,
      $.find_statement,
      $.replace_statement,
      $.shift_statement,
      $.split_statement,
      $.clear_statement,
      $.free_statement,
      $.delete_statement,
      $.read_table_statement,
      $.add_statement,
      $.append_statement,
      $.insert_statement,
      $.sort_statement,

      // Program
      $.report_statement,
      $.include_statement,
      $.perform_statement,

      // Dynpro
      $.call_sel_screen_statement,

      // Control flow
      $.try_statement,
      $.loop_at_statement,
      $.loop_at_group_statement,
      $.if_statement,
      $.while_statement,
      $.case_statement,
      $.case_type_of_statement,
      $.do_statement,
      $.return_statement,
      $.exit_statement,
      $.continue_statement,
      $.check_statement,
      $.raise_statement,
      $.raise_exception_statement,
      $.resume_statement,

      $._empty_statement,
    ),

    /**
     * Statements that are only allowed in explicit positions of the source
     * file, e.g directly from the {@link source} rule in the top level.
     * 
     * This doesnt neccessarily mean they are meaningful in this position,
     * e.g. a method implementation cant technically appear in the top level,
     * but its fine for permissive parsing.
     */
    reserved_statement: $ => choice(
      // OOP
      $.class_definition,
      $.deferred_class_definition,
      $.local_friends_spec,
      $.class_implementation,
      $.class_data_declaration,
      $.interface_definition,
      $.deferred_interface_definition,
      $.interfaces_declaration,
      $.methods_declaration,
      $.class_methods_declaration,

      // Program
      $.tables_declaration,
      $.form_definition,
      $.initialization_event,
      $.start_of_selection_event,
      $.load_of_program_event,

      // Dynpro
      $.selection_screen_statement,
      $.parameters_declaration,
      $.select_options_declaration,
      $.at_selscreen_statement,
    ),

    ...(() => {
      const root = process.cwd();
      const exclude = ["node", "generators.js", "grammar.js"];

      const rules = fs.readdirSync(root, { recursive: true, withFileTypes: true })
        .filter((f) =>
          f.isFile()
          && f.name.endsWith(".js")
          && !exclude.find((v) => f.path.includes(v) || f.name == v)
        )
        .reduce((acc, file) => {
          const fullPath = path.resolve(file.parentPath || file.path, file.name);
          return Object.assign(acc, require(fullPath));
        }, {});

      return rules
    })(),

    ...gen.kwRules(),

    ...gen.declaration_and_spec("data", $ => $.identifier),
    ...gen.declaration_and_spec("constants", $ => $.identifier),
    ...gen.declaration_and_spec("types", $ => $._type_identifier),


    _typing: $ => choice(
      $.abap_type,
      $.referred_type_spec,
      $.ref_type_spec,
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
      $.string_literal,
      $.symbol_tagged_string_literal,
      $.named_data_object
    ),

    named_data_object: $ => choice(
      $.identifier,
      $.field_symbol,
      $.data_component_selector,
      $.table_body_access
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

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPLOOP_AT_ITAB_RESULT.html
    functional_expression: $ => choice(
      $.named_data_object,
      $.constructor_expression,
      $.table_expression,
      $.method_call,
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

    // This is made up and not from the keyword documentation. It should be used
    // for positions in which a suitable named data object can be used to receive
    // the result of an operation, but also a declaration expression.
    receiving_expression: $ => choice(
      $.named_data_object,
      $.declaration_expression
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
      $.declaration_expression,
      $.named_data_object
    ),

    /**
     * https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENLOGEXP.html
     */
    _logical_expression: $ => choice(
      $.logical_expression,
      $.relational_expression,
      $._parenthesized_logical_expression,
    ),

    logical_expression: $ => choice(
      prec.right(4, seq(gen.kw('not'), $._logical_expression)),

      prec.left(3, seq(
        $._logical_expression,
        gen.kw('and'),
        $._logical_expression
      )),
      prec.left(2, seq(
        $._logical_expression,
        gen.kw('or'),
        $._logical_expression
      )),
      prec.left(1, seq(
        $._logical_expression,
        gen.kw('equiv'),
        $._logical_expression
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
    // Needs higher prec than assignment
    relational_expression: $ => prec(1, choice(
      $.comparison_expression,
      $.predicate_expression,
      $.builtin_function_call,
      $.method_call
    )),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENARITH_OPERATORS.html
    binary_operator: $ => {
      const table = [
        [prec.left, '+', PREC.plus],
        [prec.left, '-', PREC.plus],
        [prec.left, '*', PREC.times],
        [prec.left, '/', PREC.times],
        [prec.left, gen.kw("div"), PREC.times],
        [prec.left, gen.kw("mod"), PREC.times],
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
      $.arithmetic_expression,
      ')',
    )),

    _parenthesized_logical_expression: $ => alias(
      prec(PREC.parenthesized_expression, seq(
        '(',
        $._logical_expression,
        ')',
      )
      ), $.parenthesized_expression),

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
        seq(optional(gen.kw("not")), field("right", $.range_expression)),
        seq(
          optional(gen.kw("not")),
          gen.kw("in"),
          field("right", choice(
            $.data_object,
            $.method_call
          ))
        )
      ),
    ),

    range_expression: $ => seq(
      gen.kw("between"),
      field("low", $.general_expression),
      gen.kw("and"),
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
      optional(seq($.let_expression, gen.kw("in"))),
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
      seq(gen.kw("base"), field("value", $.data_object))
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
      gen.kw("for"),
      field("iter_var", $.assignment),
      // Optional when `var` is numeric as it will be incremeted implicitly
      optional(
        seq(
          gen.kw("then"),
          field("then", $.general_expression)
        )
      ),
      choice(
        seq(
          gen.kw("until"),
          field("until", $._logical_expression)
        ),
        seq(
          gen.kw("while"),
          field("while", $._logical_expression)
        ),
      ),
      optional(seq($.let_expression, gen.kw("in")))
    ),

    _simple_itab_read: $ => seq(
      field("iterator", $.named_data_object),
      gen.kw("in"),
      field("itab", $.general_expression),
      repeat(choice(
        seq(...gen.kws("index", "into"), field("index", $.identifier)),
        $.iteration_cond,
        $._iteration_index_spec
      ))
    ),

    _grouped_itab_read: $ => seq(
      gen.kw("groups"), field("group", $.identifier),
      gen.kw("of"), field("iterator", $.identifier),
      gen.kw("in"), field("itab", $.identifier),
      repeat(choice(
        seq(...gen.kws("index", "into"), field("index", $.identifier)),
        $.iteration_cond,
        $._iteration_index_spec
      )),
      ...gen.kws("group", "by"), field("group_key", $.group_key),
      optional(
        seq(
          choice(...gen.kws("ascending", "descending")),
          optional(seq(...gen.kws("as", "text")))
        )
      ),
      optional(seq(...gen.kws("without", "members")))
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENFOR_ITAB.html
    table_iteration: $ => seq(
      gen.kw("for"),
      choice(
        $._simple_itab_read,
        $._grouped_itab_read,
      ),
      optional(seq($.let_expression, gen.kw("in")))
    ),

    using_key_spec: $ => seq(
      ...gen.kws("using", "key"),
      field("name", $.identifier)
    ),

    read_key_spec: $ => seq(
      gen.kw("key"),
      field("name", $.identifier)
    ),



    _iteration_index_spec: $ => choice(
      field("from", $.lines_from),
      field("to", $.lines_to),
      field("step", $.lines_step),
    ),

    /**
     * Iteration condition for a table iteration {@link loop} or {@link table_iteration}
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENFOR_COND.html
     */
    iteration_cond: $ => prec.right(repeat1(
      choice(
        $.using_key_spec,
        seq(
          gen.kw("where"),
          field("condition", choice(
            $._logical_expression,

            // statically specified logical expression log_exp must be placed in parenthese (table iterations)
            // The parantheses here could cause a conflict with logical expressions, so they need a higher precedence.
            prec(2, seq("(", $._logical_expression, ")")),

            // dynamic where clause
            $.dynamic_cond,
            $.dynamic_cond_tab,
          )
          )
        )
      )
    )),

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
      prec(1, field("key", $.identifier)),
      field("expression", $.general_expression),
      seq(
        "(",
        repeat1(choice(
          $.group_key_component_spec,
          $.group_index_assignment,
          $.group_size_assignment
        )),
        ")"
      )
    ),

    /** Specifcation of a {@link group_key} component. */
    group_key_component_spec: $ => seq(
      field("field", $.identifier),
      "=",
      field("value", $.general_expression)
    ),

    group_index_assignment: $ => seq(
      field("field", $.identifier),
      "=",
      ...gen.kws("group", "index")
    ),

    group_size_assignment: $ => seq(
      field("field", $.identifier),
      "=",
      ...gen.kws("group", "size")
    ),

    // https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENPREDICATE_EXPRESSIONS.html
    // NOTE: Not all general expressions apparently? The docs are kind of vague here..
    predicate_expression: $ => choice(
      // operand
      seq($.general_expression, gen.kw("is"), optional(gen.kw("not")), gen.kw("initial")),
      // ref
      seq($.general_expression, gen.kw("is"), optional(gen.kw("not")), gen.kw("bound")),
      // oref
      seq($.general_expression, gen.kw("is"), optional(gen.kw("not")), gen.kw("instance"), gen.kw("of")),
      // <fs>
      seq($.general_expression, gen.kw("is"), optional(gen.kw("not")), gen.kw("assigned")),
      // parameter
      seq($.general_expression, gen.kw("is"), optional(gen.kw("not")), gen.kw("supplied")),
    ),

    _comparison_operator: $ => choice(...gen.kws(
      "eq", "ne", "gt", "lt", "ge", "le", "co", "cn", "ca", "na",
      "cs", "ns", "cp", "np", "bt", "nb", "byte-co", "byte-cn",
      "byte-ca", "byte-na", "byte-cs", "byte-ns", "o", "z", "m"
    ), "=", "<>", ">", "<", '>=', "<=",),

    _calculation_assignment_operator: $ => choice(
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
      $.itab_table_key_spec
    ),

    /**
     * Index read variant of {@link itab_line}
     */
    index_read: $ => seq(
      // If a key is specified, `INDEX` must also be used.
      optional(
        seq(
          field("key", $.read_key_spec),
          gen.kw("index")
        )
      ),
      field("index", $.numeric_expression)
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
      gen.kw("new"),
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
      gen.kw("value"),
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
      gen.kw("cond"),
      field("type", $._constructor_result),
      "(",
      optional(seq($.let_expression, gen.kw("in"))),
      repeat1(alias($._cond_case, $.case)),
      optional(alias($._else_case, $.case)),
      ")"
    ),

    // https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/abenconditional_expression_switch.html
    switch_expression: $ => seq(
      gen.kw("switch"),
      field("type", $._constructor_result),
      "(",
      field("operand", $.data_object),
      optional(seq($.let_expression, gen.kw("in"))),
      repeat1(alias($._switch_case, $.case)),
      optional(alias($._else_case, $.case)),
      ")"
    ),

    _cond_case: $ => seq(
      gen.kw("when"),
      field("predicate", $._logical_expression),
      gen.kw("then"),
      optional(seq($.let_expression, gen.kw("in"))),
      field("result", $._conditional_result)
    ),

    _switch_case: $ => seq(
      gen.kw("when"),
      field("predicate", $.data_object),
      gen.kw("then"),
      optional(seq($.let_expression, gen.kw("in"))),
      field("result", $._conditional_result)
    ),

    _else_case: $ => seq(
      gen.kw("else"), optional(seq($.let_expression, gen.kw("in"))),
      field("result", $._conditional_result)
    ),

    /**
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONSTRUCTOR_EXPRESSION_CONV.html
     */
    conv_expression: $ => seq(
      gen.kw("conv"),
      field("type", $._constructor_result),
      "(",
      optional(seq($.let_expression, gen.kw("in"))),
      field("dobj", $.general_expression),
      ")"
    ),

    /**
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONSTRUCTOR_EXPRESSION_EXACT.html
     */
    exact_expression: $ => seq(
      gen.kw("exact"),
      field("type", $._constructor_result),
      "(",
      optional(seq($.let_expression, gen.kw("in"))),
      field("dobj", $.general_expression),
      ")"
    ),

    /**
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONSTRUCTOR_EXPRESSION_EXACT.html
     */
    cast_expression: $ => seq(
      gen.kw("cast"),
      field("type", $._constructor_result),
      "(",
      optional(seq($.let_expression, gen.kw("in"))),
      field("dobj", $.general_expression),
      ")"
    ),

    /**
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONSTRUCTOR_EXPRESSION_REF.html
     */
    ref_expression: $ => seq(
      gen.kw("ref"),
      field("type", $._constructor_result),
      "(",
      optional(seq($.let_expression, gen.kw("in"))),
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
      gen.kw("corresponding"),
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
      optional(gen.kw("exact")),
      // only one of these can occur 
      optional(
        choice(
          alias($._corresponding_base_spec, $.base_spec),
          gen.kw("deep")
        )
      ),
      field("source", $.general_expression),
      optional(seq(...gen.kws("discarding", "duplicates"))),
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
      gen.kw("from"),
      field("lookup_tab", $.general_expression),
      choice(
        $.using_key_spec,
        gen.kw("using"), // primary key
      ),
      $.lookup_table_mapping_list,
      optional($.corresponding_mapping_list),
    ),

    /**
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCORRESPONDING_CONSTR_MAPPING.html
     */
    corresponding_mapping_list: $ => choice(
      seq(
        gen.kw("mapping"),
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
        optional(seq(...gen.kws("discarding", "duplicates"))),
      )
    ),

    lookup_table_mapping_list: $ => repeat1($.lookup_table_mapping),

    lookup_table_mapping: $ => seq(
      field("left", $.identifier),
      "=",
      field("right", $.identifier),
    ),

    corresponding_exception_list: $ => seq(
      gen.kw("except"),
      choice(
        "*", // all
        repeat1($.identifier)
      )
    ),

    _mapping_default: $ => seq(
      gen.kw("default"),
      $.general_expression
    ),

    _corresponding_base_spec: $ => seq(
      choice(
        // just the addition base, default..
        gen.kw("base"),
        // if appending is specified, base has the same effect and is optional
        seq(gen.kw("appending"), optional(gen.kw("base"))),
        // the most specific form
        seq(...gen.kws("deep", "appending"), optional(gen.kw("base")))
      ),
      "(",
      field("base", $.data_object),
      ")"
    ),

    /**
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONSTRUCTOR_EXPRESSION_FILTER.html
     */
    filter_expression: $ => seq(
      gen.kw("filter"),
      field("type", $._constructor_result),
      "(",
      field("itab", $.general_expression),
      optional(gen.kw("except")),

      optional($.using_key_spec),
      optional($.filter_tab_spec),

      gen.kw("where"),
      $._logical_expression,
      ")"
    ),

    filter_tab_spec: $ => seq(
      gen.kw("in"),
      field("ftab", $.general_expression), // functional operand position?
      optional($.using_key_spec),
    ),

    /**
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONSTRUCTOR_EXPRESSION_REDUCE.html
     */
    reduce_expression: $ => seq(
      gen.kw("reduce"),
      field("type", $._constructor_result),
      "(",
      optional(seq($.let_expression, gen.kw("in"))),
      $.reduce_init,
      repeat1($.iteration_expression),
      $.reduce_next,
      ")"
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPLET.html
    let_expression: $ => seq(
      gen.kw("let"),
      repeat1($.assignment)
    ),

    /**
     * INIT part of a {@link reduce_expression}
     */
    reduce_init: $ => seq(
      gen.kw("init"),
      repeat1($.init_spec)
    ),

    /**
     * NEXT part of a {@link reduce_expression}
     */
    reduce_next: $ => seq(
      gen.kw("next"),
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
      gen.kw("optional"),
      seq(
        gen.kw("default"),
        field("default", $.general_expression)
      )
    ),

    /**
     * THROW exception addition of {@link cond_expression}, {@link switch_expression}
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONDITIONAL_EXPRESSION_RESULT.html
     */
    throw_exception: $ => seq(
      gen.kw("throw"),
      optional(gen.kw("resumable")),
      optional(gen.kw("shortdump")),
      field("name", $._type_identifier),
      "(",
      optional($.inline_message_spec),
      ")"
    ),


    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPSET_UPDATE_TASK_LOCAL.html
    local_updates_statement: $ => seq(
      ...gen.kws("set", "update", "task", "local"),
      "."
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCOMMIT.html
    commit_work_statement: $ => seq(
      ...gen.kws("commit", "work"),
      optional(seq(...gen.kws("and", "wait"))),
      "."
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPROLLBACK.html
    rollback_work_statement: $ => seq(
      ...gen.kws("rollback", "work"), "."
    ),

    /**
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abapmessage.html
     */
    message: $ => seq(
      gen.kw("message"),
      choice(
        seq(":", commaSep1($.message_spec)),
        $.message_spec
      ),
      "."
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
              field("text", choice($.string_literal, $.symbol_tagged_string_literal)),
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
              gen.kw("into"),
              field("into", choice(
                $.named_data_object,
                $.declaration_expression
              ))
            ),
            seq(gen.kw("raising"), field("raising", $.identifier)),
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
          field("id", choice($._immediate_identifier, $._immediate_number)),
          token.immediate(")"),
        )
      )
    ),

    /**
     * Long form specification of a message type, number and ID where each
     * can also be specified dynamically through the value of a data object.
     */
    _long_form_message_id: $ => seq(
      gen.kw("id"),
      field("id", $.data_object),

      // Not technically optional, but theres not really any ambiguity in
      // this context and it makes highlighting smoother..
      optional($._message_type_spec),
      optional(
        seq(
          gen.kw("number"),
          field("number", $.data_object),
        )
      )
    ),

    _message_type_spec: $ => seq(
      gen.kw("type"),
      field("type", $.data_object)
    ),

    message_arguments: $ => seq(
      gen.kw("with"), prec.right(repeat1($.general_expression))
    ),

    _message_display_override: $ => seq(
      seq(
        ...gen.kws("display", "like"),
        field("display_type", $.data_object)
      )
    ),

    _constructor_result: $ => choice(
      "#", // inferred
      $._type_identifier // explicit
    ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENINLINE_DECLARATIONS.html
    declaration_expression: $ => seq(
      choice(
        seq(
          choice(...gen.kws("final", "data")),
          // Do we use immediate here? Does that fall under being permissive?..
          token.immediate("("),
          field("name", $._immediate_identifier),
          token.immediate(")")
        ),
        seq(
          gen.kw("field-symbol"),
          token.immediate("("),
          field("name", $._immediate_field_symbol),
          token.immediate(")")
        )
      )
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
        field("left", $.writable_expression),
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
      ...gen.kws("call", "method"),
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
      ...gen.kws("call", "function"),
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
      gen.kw("destination"),
      choice(
        field("destination", $.data_object),
        seq(
          ...gen.kws("in", "group"),
          field("group", choice(
            $.named_data_object,
            gen.kw("default")
          ))
        )
      )
    ),

    _sync_rfc_session_spec: $ => seq(
      ...gen.kws("in", "remote", "session"),
      field("session", $.named_data_object)
    ),

    _async_rfc_task_spec: $ => seq(
      ...gen.kws("starting", "new", "task"),
      field("task_id", $.data_object)
    ),

    _async_rfc_callback_spec: $ => seq(
      choice(
        seq(
          gen.kw("calling"),
          field("callback_method", choice(
            $.identifier,
            $.object_component_selector,
            $.class_component_selector
          ))
        ),
        seq(
          gen.kw("performing"),
          field("callback_routine", $.identifier)
        )
      ),
      ...gen.kws("on", "end", "of", "task")
    ),

    _bg_rfc_unit_spec: $ => seq(
      ...gen.kws("in", "background", "unit"),
      field("background_unit", $.named_data_object)
    ),

    /**
     * Despite being an obsolete language element, this is still used quite often.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPCALL_FUNCTION_BACKGROUND_TASK.html
     */
    _transactional_rfc_spec: $ => prec.right(seq(
      ...gen.kws("in", "background", "task"),
      optional(seq(...gen.kws("as", "separate", "unit"))),
      optional(seq(
        gen.kw("destination"),
        field("destination", $.data_object)
      ))
    )),

    _update_task_spec: $ => seq(
      ...gen.kws("in", "update", "task"),
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
            gen.kw_tagged("exporting", $.argument_list),
            gen.kw_tagged("importing", $.argument_list),
            gen.kw_tagged("changing", $.argument_list),
            gen.kw_tagged("exceptions", $.argument_list),
            gen.kw_tagged("receiving", $.named_argument),
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
      optional(seq($.let_expression, gen.kw("in"))),
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

    _importing_args: $ => gen.kw_tagged("importing", $._named_argument_list),
    _exporting_args: $ => gen.kw_tagged("exporting", $._named_argument_list),
    _changing_args: $ => gen.kw_tagged("changing", $._named_argument_list),
    _receiving_args: $ => gen.kw_tagged("receiving", $._named_argument_list),
    _tables_args: $ => gen.kw_tagged("tables", $._named_argument_list),
    _exceptions_args: $ => gen.kw_tagged("exceptions", $._exception_mapping_list),
    _parameter_table_args: $ => gen.kw_tagged("parameter-table", $.named_data_object),
    _exception_table_args: $ => gen.kw_tagged("exception-table", $.named_data_object),

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
      typeOrLikeExpr($, optional(seq(...gen.kws("line", "of")))),
      repeat(choice(
        seq(
          gen.kw("value"),
          field("value", choice(
            $.number,
            $.string_literal,
            seq(...gen.kws("is", "initial")),
            $.identifier,
          ))
        ),
        gen.kw("read-only"))
      )
    )),

    /**
     * Reference (NOT DERIVED) type to another type declared with `ref to`.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPDATA_REFERENCES.html
     */
    ref_type_spec: $ => prec.right(seq(
      typeOrLikeExpr($, seq(...gen.kws("ref", "to"))),

      // Not technically valid for types declarations but intentionally tolerated.
      repeat(choice(
        seq(...gen.kws("value", "is", "initial")),
        seq(...gen.kws("read-only"))
      ))
    )),

    /**
     * Only the `ref to xyz` part of a reference type specification to
     * be inlined into other type specifications such as {@link table_type_spec}
     */
    _inline_ref_type_spec: $ => seq(
      ...gen.kws("ref", "to"),
      choice(
        $._type_identifier,
        $.type_component_selector
      )
    ),

    _inline_ref_data_spec: $ => seq(
      ...gen.kws("ref", "to"),
      choice(
        $.identifier,
        $.data_component_selector
      )
    ),

    _exception_mapping_list: $ => alias(repeat1($.exception_mapping), $.argument_list),

    exception_mapping: $ => seq(
      field("name", $.identifier),
      "=",
      field("value", $.number),
      optional(seq(
        gen.kw("message"),
        field("message", $.named_data_object)
      ))
    ),



    group_by_spec: $ => seq(
      ...gen.kws("group", "by"),
      field("key", $.group_key),
      repeat(
        choice(
          field("order", $.sort_order),
          field("members", $.without_members_spec),
          field("group_result", $._group_by_result)
        )
      )
    ),


    without_members_spec: $ => seq(
      ...gen.kws("without", "members")
    ),


    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPLOOP_AT_ITAB_GROUP_BY_BINDING.html
    _group_by_result: $ => choice(
      $.into_spec,
      $.assigning,
      $.reference_into,
    ),

    into_spec: $ => seq(
      gen.kw("into"),
      field("work_area", choice(
        $.named_data_object,
        $.declaration_expression
      )),
    ),

    assigning: $ => seq(
      ...gen.kws("assigning"),
      field("work_area", choice(
        $.field_symbol,
        $.declaration_expression
      )),
      optional(gen.kw("casting")),
      optional(seq(...gen.kws("else", "unassign"))),
    ),

    reference_into: $ => seq(
      ...gen.kws("reference", "into"),
      field("work_area", choice(
        $.field_symbol,
        $.declaration_expression
      )),
    ),

    transporting_no_fields_spec: $ => seq(
      ...gen.kws("transporting", "no", "fields")
    ),

    statement_block: $ => prec.right(repeat1(choice(
      $.simple_statement,
      $.general_expression,
      $.docstring
    ))),

    /**
     * INCLUDE {TYPE | STRUCTURE} inside struct declaration (BEGIN OF...).
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPINCLUDE_TYPE.html
     */
    struct_include: $ => seq(
      gen.kw("include"),
      field("name", choice(
        seq(gen.kw("type"), $.identifier),
        seq(gen.kw("structure"), $.identifier),
      )),
      optional(
        seq(gen.kw("as"), field("alias", $.identifier)),
      ),
      optional(
        seq(
          ...gen.kws("renaming", "with", "suffix"),
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

    // lower precedence than dyn spec due to conflicts in sort ... by (comp or otab ???) ...
    dynamic_component: $ => seq(
      "(",
      choice(
        field("name", choice(
          $._immediate_identifier,
          $._immediate_string_literal,
        )),
        field("offset", $._immediate_number),
      ),
      token.immediate(")")
    ),

    _immediate_dyn_spec: $ => seq(
      token.immediate("("),
      field("name", choice(
        $._immediate_identifier,
        $._immediate_string_literal
      )),
      token.immediate(")")
    ),

    dyn_spec: $ => seq(
      "(",
      field("name", choice(
        $._immediate_identifier,
        $._immediate_string_literal
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
          $.table_expression,
          $.field_symbol
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

    table_body_access: $ => seq(
      field("table", $.identifier),
      token.immediate("[]")
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

    // [[/][pos|POS_LOW|POS_HIGH](len)
    output_position_spec: $ => prec.right(repeat1(
      choice(
        "/",
        field("position", choice(
          $.number,
          alias(
            choice("POS_LOW", "POS_HIGH"),
            $.identifier
          )
        )),
        gen.immediateTightParens(field("length", $.number))
      )
    )),

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
        $.string_literal,
        $.symbol_tagged_string_literal,
        $.number,
        // dynamic dobj specification, do we wrap this in something for querying?
        seq("(", $._immediate_identifier, token.immediate(")")),
        $.method_call
      ))
    ),

    inline_comment: $ => prec(0, seq('"', /[^\n\r]*/)),

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

    scope_directive: $ => prec.left(repeat1(".")),

    linked_object_kind: $ => choice(...gen.caseInsensitive(
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
    _empty_statement: $ => token("."),

    _name: $ => IDENTIFIER_REGEX,

    identifier: $ => prec(-1, choice($._name, $._contextual_keyword)),

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
    _contextual_keyword: $ => prec(-1, choice(
      ...gen.caseInsensitive(
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

    _immediate_field_symbol: $ => seq(
      token.immediate('<'),
      field("name", $._immediate_identifier),
      token.immediate(">")
    ),

    _type_identifier: $ => alias($.identifier, $.type_identifier),

    _immediate_identifier: $ => alias(token.immediate(IDENTIFIER_REGEX), $.identifier),

    _immediate_type_identifier: $ => alias(token.immediate(IDENTIFIER_REGEX), $.type_identifier),

    number: $ => NUMBER_REGEX,
    _immediate_number: $ => alias(token.immediate(NUMBER_REGEX), $.number),
    _immediate_string_literal: $ => alias(
      choice(
        token.immediate(/'[^']*'/),
        token.immediate(/`[^`]*`/),
      ),
      $.string_literal
    ),

    string_literal: $ => choice(
      /'[^']*'/,
      /`[^`]*`/
    ),

    symbol_tagged_string_literal: $ => prec(1, seq(
      field("text", $.string_literal),
      gen.immediateTightParens(field("symbol", $.number))
    )),
  }
});


function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)))
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
      gen.kw("type"),
      addition,
      field("name", choice(
        $._type_identifier,
        $.type_component_selector,
        ...extraChoices
      ))
    ),
    seq(
      gen.kw("like"),
      addition,
      field("dobj", choice(
        $.identifier,
        $.data_component_selector
      ))
    ),
  );
}


