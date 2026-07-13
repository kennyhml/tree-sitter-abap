/**
 * @file Abap grammar for tree-sitter
 * @author Kendrick Hommel <kendrick.hommel@gmail.com>
 * @license MIT
 */
global.gen = require("./grammar/_utils/generators.js");
const fs = require("fs");
const path = require("path");

const IDENTIFIER_REGEX = /([a-z_\/%][%a-z\d_\/]*)/i;

// ABAP does allow + and - before any number. However, allowing both inside the regex, we run
// into an issue where the lexer considers the offset in a substring access like str+10 as
// a single positive number token. I believe the minus should be safe though, so we can at
// least allow that. An explicit + is rarely ever needed anyway..
const NUMBER_REGEX = /-?\d+/;

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
    [$.at_selscreen_statement],
    [$.initialization_event],
    [$.start_of_selection_event],
    [$.load_of_program_event],
    [$._named_argument_list],
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
    $.typing,
    $.simple_statement,
    $.reserved_statement,
    $.named_data_object,

    $.constructor_expression,

    $.data_object,

    $.general_expression,
    $.functional_expression,
    $.iteration_expression,
    $.writable_expression,
    $.calculation_expression,
    $.receiving_expression,
    $.string_expression,
    $.itab_comp,
    $.numeric_expression,
    $.character_like_expression,
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
          $.docstring,
        ),
      );
    },

    /**
     * A statement that may appear anywhere in the code. This doesnt necessarily
     * mean it needs to be valid or meaningful in the current position, but it
     * excludes things such as event processing blocks or class declarations,
     * which is needed e.g because the start of such an event block may terminate
     * another rather than becoming part of it.
     */
    simple_statement: $ =>
      prec(
        1,
        choice(
          // Fundamental declarations
          $.data_declaration,
          $.field_symbols_declaration,
          $.types_declaration,
          $.constants_declaration,
          $.include_structure,
          $.include_type,

          // ???
          $.assignment,
          $.calculation_assignment,
          $.message_statement,
          $.function_call,

          // Processing statements
          $.call_function_statement,
          $.call_method_statement,
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
          $.move_corresponding_statement,
          $.unpack_statement,
          $.assign_statement,
          $.unassign_statement,
          $.get_reference_statement,
          $.convert_text_statement,
          $.overlay_statement,
          $.translate_statement,
          $.set_bit_statement,
          $.get_bit_statement,
          $.write_to_statement,
          $.get_time_statement,
          $.get_timestamp_statement,
          $.convert_timestamp_statement,
          $.convert_into_timestamp_statement,
          $.convert_utclong_statement,
          $.convert_into_utclong_statement,
          $.collect_statement,

          $.describe_field_statement,
          $.describe_table_statement,
          $.describe_distance_statement,

          // Program
          $.report_statement,
          $.program_statement,
          $.include_statement,
          $.perform_statement,
          $.set_update_task_local_statement,
          $.commit_work_statement,
          $.rollback_work_statement,

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
          $.raise_shortdump_statement,
          $.raise_exception_statement,
          $.resume_statement,
          $.wait_up_to_statement,

          $._empty_statement,
        ),
      ),

    /**
     * Statements that are only allowed in explicit positions of the source
     * file, e.g directly from the {@link source} rule in the top level.
     *
     * This doesnt neccessarily mean they are meaningful in this position,
     * e.g. a method implementation cant technically appear in the top level,
     * but its fine for permissive parsing.
     */
    reserved_statement: $ =>
      prec.dynamic(
        2,
        choice(
          // OOP
          $.class_declaration,
          $.deferred_class_declaration,
          $.local_friends_declaration,
          $.class_implementation,
          $.class_data_declaration,
          $.interface_declaration,
          $.deferred_interface_declaration,
          $.interfaces_declaration,
          $.methods_declaration,
          $.method_implementation,
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
      ),

    typing: $ =>
      choice(
        $.builtin_type_spec,
        $.referred_type,
        $.type_line_of,
        $.reference_type,
        $.table_type,
        $.range_type,
      ),

    ...(() => {
      const root = process.cwd();
      const exclude = ["node", "generators.js", "grammar.js"];

      const rules = fs
        .readdirSync(root, { recursive: true, withFileTypes: true })
        .filter(
          f =>
            f.isFile() &&
            f.name.endsWith(".js") &&
            !exclude.find(
              v => (f.parentPath || f.path).includes(v) || f.name == v,
            ),
        )
        .reduce((acc, file) => {
          const fullPath = path.resolve(
            file.parentPath || file.path,
            file.name,
          );
          return Object.assign(acc, require(fullPath));
        }, {});

      return rules;
    })(),

    ...gen.kwRules(),

    ...gen.declaration_and_spec("data", $ => $.identifier),
    ...gen.declaration_and_spec("constants", $ => $.identifier),
    ...gen.declaration_and_spec("types", $ => $.identifier),

    /**
     * In ABAP, parentheses cant just arbitrarly be added anywhere like in most modern languages.
     * They can, however, be used around arithmetic expressions and logical expressions.
     *
     * WARN: Can cause ambiguity. Consider:
     * value type( ( field = abap_true ) )
     *
     * The parser can get confused here because the value expression receives an expression
     * that could be a parenthesized expression wrapping a logical expression if we allowed it.
     *
     * The best way to solve this is to not allow general expressions as operands in such
     * positions.
     *
     * @see https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENARITH_BRACKETS.html
     */
    parenthesized_expression: $ =>
      prec(5, seq("(", choice($.arithmetic_expression, $.bit_expression), ")")),

    /**
     * A builtin (keyword) expression resulting in the creation of a certain value.
     *
     * For example `NEW`, `VALUE`, `COND`, etc.. Refer to the link for more examples.
     *
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCONSTRUCTOR_OPERATOR_GLOSRY.html
     */
    constructor_expression: $ =>
      choice(
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
        $.reduce_expression,
      ),

    /**
     * https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENDATA_OBJECTS.html
     */
    data_object: $ =>
      prec(
        100,
        choice(
          $.substring_access,
          $.number,
          $.string_literal,
          $.named_data_object,
        ),
      ),

    named_data_object: $ =>
      choice(
        $.identifier,
        $.field_symbol,
        $.text_symbol,
        $.component_selection,
        $.table_body_access,
      ),

    // https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENGENERAL_EXPR_POSITION_GLOSRY.html
    general_expression: $ =>
      choice(
        $.data_object,
        $.constructor_expression,
        $.function_call,
        $.table_expression,
        $.arithmetic_expression,
        $.bit_expression,
        $.parenthesized_expression,
        $.string_expression,
        $.dereference_expression,
      ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPLOOP_AT_ITAB_RESULT.html
    functional_expression: $ =>
      choice(
        $.named_data_object,
        $.constructor_expression,
        $.table_expression,
        $.function_call,
      ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENCALCULATION_EXPRESSION_GLOSRY.html
    calculation_expression: $ =>
      choice($.arithmetic_expression, $.string_expression, $.bit_expression),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENNUMERICAL_EXPRESSION_GLOSRY.html
    numeric_expression: $ =>
      prec(
        1,
        choice(
          $.named_data_object,
          $.number,
          $.constructor_expression,
          $.function_call,
          $.table_expression,
          $.arithmetic_expression,
        ),
      ),

    // This is made up and not from the keyword documentation. It should be used
    // for positions in which a suitable named data object can be used to receive
    // the result of an operation, but also a declaration expression.
    receiving_expression: $ =>
      choice($.named_data_object, $.declaration_expression),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENSTRING_EXPRESSION_POSITIONS.html
    character_like_expression: $ =>
      choice(
        $.data_object,
        $.constructor_expression,
        $.string_expression,
        $.table_expression,
        $.function_call,
      ),

    /**
     * A LHS operand that can be written to, can be specified in **write positions**.
     *
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENWRITABLE_EXPRESSION_GLOSRY.html
     */
    writable_expression: $ =>
      choice(
        $.new_expression,
        $.cast_expression,
        $.table_expression,
        $.declaration_expression,
        $.named_data_object,
        $.dereference_expression,
      ),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/abapcompute_string.html
    string_expression: $ => choice($.string_template, $.string_concatenation),

    // https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENITAB_COMPONENTS.html
    // prec solves  ... SORT itab BY (var) <<< is var a dynamic itab component spec or an order table spec???
    itab_comp: $ =>
      prec(
        1,
        choice(
          $.identifier,
          $.component_selection,
          $.substring_access,
          $.dynamic_spec,
        ),
      ),

    _constructor_result: $ =>
      choice(
        "#", // inferred
        $.identifier, // explicit
      ),

    /**
     * Bad idea to allow general expression here as that boils down to identifiers
     * which then causes conflicts on statements scopes that dont have a well defined
     * END<> statement delimeter (such as AT SELECTION SCREEN)
     */
    statement_block: $ =>
      prec.left(
        repeat1(choice($.simple_statement, $.docstring, $.general_expression)),
      ),

    /**
     * INCLUDE {TYPE | STRUCTURE} inside struct declaration (BEGIN OF...).
     *
     * https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABAPINCLUDE_TYPE.html
     */

    // lower precedence than dyn spec due to conflicts in sort ... by (comp or otab ???) ...

    table_body_access: $ =>
      seq(field("table", $.identifier), token.immediate("[]")),

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
     * only appear in a very specific position, unlike keywords that introduce a `general_expression`.
     *
     * Consider the following code:
     *
     * ceil( value i( 10 )).
     *
     * The builtin function could receive either a `named_argument or a `positional_argument`.
     * So during lexical analysis, the parser considers that the word could either be a `value`
     * keyword or a `value` identifier. The keyword ends up taking higher lexical precendence (as it should)
     * and as a result, the branch containing the identifier rule is pruned.
     *
     * The only way to resolve this is to make sure that the other branch doesnt get dropped, so both
     * can be explored and the contextually correct one is chosen. For this reason, the keywords must
     * be added to the `identifier` rule as well and aliased to an identifier. Do however make sure
     * that they have a lower precedence to express:
     *
     * If theres a keyword valid in that context, use that. Otherwise consider the keyword to be an identifier.
     *
     * Things if tried to make this work better:
     *
     * - Automatically walk the rules to add affected keywords
     *   -> Hard to identify the rules where conflicts can occur
     * - Join the keywords into one regex to reduce parser size
     *   -> The more concrete rule always wins
     * - Literally just add all keywords
     *   -> Tree-sitter kills itself due to running out of memory, tons of parsing conflicts
     *
     * WARN: Be cautious what keywords are added, things such as ... IMPORTING importing ...
     * already work out of the box due to context aware lexing. Each keyword added here
     * increases parser size a ton!
     *
     * TODO: Another thing that would help is actually merge keywords that belong together.
     * For example instead of _kw_at we have _kw_at_selection_screen, _kw_at_end_of, etc..
     * We could save keywords that way, but partial highlighting would also suffer mid typing
     * Would also get rid of READ (table), CALL (function), LOOP (at)..
     *
     * Great for testing: https://www.abapforum.com/forum/viewtopic.php?p=21654
     */
    _contextual_keyword: $ => {
      return prec(
        -1,
        choice(
          ...gen.caseInsensitive(
            "value",
            "new",
            "cond",
            "switch",
            "cast",
            "conv",
            "ref",
            "any",
            "filter",
            "reduce",
            "text",
            "initialization",

            "class",
            "method",

            "data",
            "types",
            "constants",

            "condense",
            "split",
            "replace",
            "call",
            "if",
            "case",
            "include",
            "perform",
            "form",
            "at",
            "parameters",

            "check",
            "return",
            "continue",
            "exit",
            "try",
            "raise",
            "tables",
            "corresponding",
            "loop",
            "read",
            "sort",
            "insert",
            "delete",
            "append",
            "interfaces",
            "interface",
            "methods",
          ),
        ),
      );
    },

    _immediate_identifier: $ =>
      alias(token.immediate(IDENTIFIER_REGEX), $.identifier),

    number: $ => NUMBER_REGEX,
    _immediate_number: $ => alias(token.immediate(NUMBER_REGEX), $.number),
    _immediate_string_literal: $ =>
      alias(
        choice(token.immediate(/'[^']*'/), token.immediate(/`[^`]*`/)),
        $.string_literal,
      ),

    string_literal: $ => choice(/'[^']*'/, /`[^`]*`/),
  },
});
