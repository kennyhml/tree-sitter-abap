global.gen = require('./grammar/core/generators.js')
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
    // started being needed since the component expression refactor, can probably figure this out.
    [$._immediate_identifier, $._immediate_type_identifier]
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
    $.named_data_object,

    $.constructor_expression,

    $.data_object,

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
      $.field_symbols_declaration,
      $.types_declaration,
      $.constants_declaration,

      // ???
      $.assignment,
      $.message_statement,

      // Processing statements
      $.call_function_statement,
      $.call_method_statement,
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

    /**
     * A builtin (keyword) expression resulting in the creation of a certain value. 
     * 
     * For example `NEW`, `VALUE`, `COND`, etc.. Refer to the link for more examples.
     * 
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONSTRUCTOR_OPERATOR_GLOSRY.html 
     */
    constructor_expression: $ => choice(
      $.switch_expression,
      $.cond_expression,
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
    data_object: $ => prec(100, choice(
      $.substring_access,
      $.number,
      $.string_literal,
      $.named_data_object
    )),

    named_data_object: $ => choice(
      $.identifier,
      $.field_symbol,
      $.text_symbol,
      $.component_expression,
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
      $.string_expression,
      $.dereference_expression
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
    numeric_expression: $ => prec(1, choice(
      $.identifier,
      $.field_symbol,
      $.number,
      $.component_expression,
      $.constructor_expression,
      $.builtin_function_call,
      $.method_call,
      $.table_expression,
      $.arithmetic_expression
    )),

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
      $.named_data_object,
      $.dereference_expression
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



    read_key_spec: $ => seq(
      gen.kw("key"),
      field("name", $.identifier)
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
    // prec solves  ... SORT itab BY (var) <<< is var a dynamic itab component spec or an order table spec???
    itab_comp: $ => prec(1, choice(
      $._static_itab_comp,
      $.dynamic_expression
    )),

    /**
     * Static variant of {@link itab_comp}: `{ comp_name[-sub_comp][{+off(len)}|{->attr}] }`
     */
    _static_itab_comp: $ => choice(
      $.identifier,
      $.component_expression,
      $.substring_access,
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


    _constructor_result: $ => choice(
      "#", // inferred
      $._type_identifier // explicit
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

    // lower precedence than dyn spec due to conflicts in sort ... by (comp or otab ???) ...

    table_body_access: $ => seq(
      field("table", $.identifier),
      token.immediate("[]")
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
        $.number,
        // dynamic dobj specification, do we wrap this in something for querying?
        seq("(", $._immediate_identifier, token.immediate(")")),
        $.method_call
      ))
    ),

    inline_comment: $ => prec(0, seq('"', /[^\n\r]*/)),




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
        "text",
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
  }
});


