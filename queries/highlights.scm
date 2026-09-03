; Low-priority fallbacks keep recognized identifiers and opaque parser recovery
; spans highlighted. More specific captures below override these.
(ERROR) @variable
(identifier) @variable

(string_literal) @string
(string_template) @string
(number) @number

; Keywords are aliased to anonymous snake_cased literal representations.
; This alone would not allow us to query them. For that reason, they are
; tagged with a keyword field. That gives us more control, as some keywords 
; can overlap with other tokens. See the table_type capture for instance.
; Bonus points for not having to maintain a huge alternation of literals :)
(_ keyword:  _ @keyword)

; This is purely for better partial highlighting efforts during invalid
; state of the code and not to be seen semantically correct.
(ERROR _ @keyword
  (#match? @keyword "^[a-zA-Z_][a-zA-Z0-9_]*$"))
(ERROR (identifier) @variable)

[
   (inline_comment)
   (line_comment)
   (multi_line_comment)
] @comment

[
   (pragma)
   (pseudo_comment)
] @keyword.directive


(function_call 
  name: (identifier) @function.builtin @function.call
  (#match? @function.builtin "^([bB][oO][oO][lL][cC]|[bB][oO][oO][lL][xX]|[xX][sS][dB][bB][oO][oO][lL]|[cC][oO][nN][tT][aA][iI][nN][sS]|[cC][oO][nN][tT][aA][iI][nN][sS]_[aA][nN][yY]_[oO][fF]|[cC][oO][nN][tT][aA][iI][nN][sS]_[aA][nN][yY]_[nN][oO][tT]_[oO][fF]|[mM][aA][tT][cC][hH][eE][sS]|[lL][iI][nN][eE]_[eE][xX][iI][sS][tT][sS]|[aA][bB][sS]|[cC][eE][iI][lL]|[fF][lL][oO][oO][rR]|[fF][rR][aA][cC]|[sS][iI][gG][nN]|[tT][rR][uU][nN][cC]|[iI][pP][oO][wW]|[nN][mM][aA][xX]|[nN][mM][iI][nN]|[aA][cC][oO][sS]|[aA][sS][iI][nN]|[aA][tT][aA][nN]|[cC][oO][sS]|[sS][iI][nN]|[tT][aA][nN]|[cC][oO][sS][hH]|[sS][iI][nN][hH]|[tT][aA][nN][hH]|[eE][xX][pP]|[lL][oO][gG]|[lL][oO][gG]10|[sS][qQ][rR][tT]|[rR][oO][uU][nN][dB]|[rR][eE][sS][cC][aA][lL][eE]|[gG][aA][mM][mM][aA]|[lL][oO][gG]_[gG][aA][mM][mM][aA]|[gG][aA][mM][mM][aA]_[lL][oO][wW][eE][rR]|[fF][aA][cC][tT][oO][rR][iI][aA][lL]|[bB][iI][nN][oO][mM][iI][aA][lL]|[eE][rR][fF]|[eE][rR][fF][cC]|[eE][rR][fF]_[iI][nN][vV]|[eE][rR][fF][cC]_[iI][nN][vV]|[cC][hH][aA][rR][lL][eE][nN]|[dD][bB][mM][aA][xX][lL][eE][nN]|[nN][uU][mM][oO][fF][cC][hH][aA][rR]|[sS][tT][rR][lL][eE][nN]|[cC][hH][aA][rR]_[oO][fF][fF]|[cC][mM][aA][xX]|[cC][mM][iI][nN]|[cC][oO][uU][nN][tT]|[cC][oO][uU][nN][tT]_[aA][nN][yY]_[oO][fF]|[cC][oO][uU][nN][tT]_[aA][nN][yY]_[nN][oO][tT]_[oO][fF]|[dD][iI][sS][tT][aA][nN][cC][eE]|[cC][oO][nN][dB][eE][nN][sS][eE]|[cC][oO][nN][cC][aA][tT]_[lL][iI][nN][eE][sS]_[oO][fF]|[eE][sS][cC][aA][pP][eE]|[fF][iI][nN][dB]|[fF][iI][nN][dB]_[eE][nN][dB]|[fF][iI][nN][dB]_[aA][nN][yY]_[oO][fF]|[fF][iI][nN][dB]_[aA][nN][yY]_[nN][oO][tT]_[oO][fF]|[iI][nN][sS][eE][rR][tT]|[mM][aA][tT][cC][hH]|[rR][eE][pP][eE][aA][tT]|[rR][eE][pP][lL][aA][cC][eE]|[rR][eE][vV][eE][rR][sS][eE]|[sS][eE][gG][mM][eE][nN][tT]|[sS][hH][iI][fF][tT]_[lL][eE][fF][tT]|[sS][hH][iI][fF][tT]_[rR][iI][gG][hH][tT]|[sS][uU][bB][sS][tT][rR][iI][nN][gG]|[sS][uU][bB][sS][tT][rR][iI][nN][gG]_[aA][fF][tT][eE][rR]|[sS][uU][bB][sS][tT][rR][iI][nN][gG]_[fF][rR][oO][mM]|[sS][uU][bB][sS][tT][rR][iI][nN][gG]_[bB][eE][fF][oO][rR][eE]|[sS][uU][bB][sS][tT][rR][iI][nN][gG]_[tT][oO]|[tT][oO]_[uU][pP][pP][eE][rR]|[tT][oO]_[lL][oO][wW][eE][rR]|[tT][oO]_[mM][iI][xX][eE][dB]|[fF][rR][oO][mM]_[mM][iI][xX][eE][dB]|[tT][rR][aA][nN][sS][lL][aA][tT][eE]|[xX][sS][tT][rR][lL][eE][nN]|[bB][iI][tT]-[sS][eE][tT]|[uU][tT][cC][lL][oO][nN][gG]_[cC][uU][rR][rR][eE][nN][tT]|[uU][tT][cC][lL][oO][nN][gG]_[aA][dB][dB]|[uU][tT][cC][lL][oO][nN][gG]_[dD][iI][fF][fF]|[lL][iI][nN][eE][sS]|[lL][iI][nN][eE]_[iI][nN][dB][eE][xX])$")
)

(function_call 
  name: (identifier) @function.method @function.method.call
  (#not-match? @function.method "^([bB][oO][oO][lL][cC]|[bB][oO][oO][lL][xX]|[xX][sS][dB][bB][oO][oO][lL]|[cC][oO][nN][tT][aA][iI][nN][sS]|[cC][oO][nN][tT][aA][iI][nN][sS]_[aA][nN][yY]_[oO][fF]|[cC][oO][nN][tT][aA][iI][nN][sS]_[aA][nN][yY]_[nN][oO][tT]_[oO][fF]|[mM][aA][tT][cC][hH][eE][sS]|[lL][iI][nN][eE]_[eE][xX][iI][sS][tT][sS]|[aA][bB][sS]|[cC][eE][iI][lL]|[fF][lL][oO][oO][rR]|[fF][rR][aA][cC]|[sS][iI][gG][nN]|[tT][rR][uU][nN][cC]|[iI][pP][oO][wW]|[nN][mM][aA][xX]|[nN][mM][iI][nN]|[aA][cC][oO][sS]|[aA][sS][iI][nN]|[aA][tT][aA][nN]|[cC][oO][sS]|[sS][iI][nN]|[tT][aA][nN]|[cC][oO][sS][hH]|[sS][iI][nN][hH]|[tT][aA][nN][hH]|[eE][xX][pP]|[lL][oO][gG]|[lL][oO][gG]10|[sS][qQ][rR][tT]|[rR][oO][uU][nN][dB]|[rR][eE][sS][cC][aA][lL][eE]|[gG][aA][mM][mM][aA]|[lL][oO][gG]_[gG][aA][mM][mM][aA]|[gG][aA][mM][mM][aA]_[lL][oO][wW][eE][rR]|[fF][aA][cC][tT][oO][rR][iI][aA][lL]|[bB][iI][nN][oO][mM][iI][aA][lL]|[eE][rR][fF]|[eE][rR][fF][cC]|[eE][rR][fF]_[iI][nN][vV]|[eE][rR][fF][cC]_[iI][nN][vV]|[cC][hH][aA][rR][lL][eE][nN]|[dD][bB][mM][aA][xX][lL][eE][nN]|[nN][uU][mM][oO][fF][cC][hH][aA][rR]|[sS][tT][rR][lL][eE][nN]|[cC][hH][aA][rR]_[oO][fF][fF]|[cC][mM][aA][xX]|[cC][mM][iI][nN]|[cC][oO][uU][nN][tT]|[cC][oO][uU][nN][tT]_[aA][nN][yY]_[oO][fF]|[cC][oO][uU][nN][tT]_[aA][nN][yY]_[nN][oO][tT]_[oO][fF]|[dD][iI][sS][tT][aA][nN][cC][eE]|[cC][oO][nN][dB][eE][nN][sS][eE]|[cC][oO][nN][cC][aA][tT]_[lL][iI][nN][eE][sS]_[oO][fF]|[eE][sS][cC][aA][pP][eE]|[fF][iI][nN][dB]|[fF][iI][nN][dB]_[eE][nN][dB]|[fF][iI][nN][dB]_[aA][nN][yY]_[oO][fF]|[fF][iI][nN][dB]_[aA][nN][yY]_[nN][oO][tT]_[oO][fF]|[iI][nN][sS][eE][rR][tT]|[mM][aA][tT][cC][hH]|[rR][eE][pP][eE][aA][tT]|[rR][eE][pP][lL][aA][cC][eE]|[rR][eE][vV][eE][rR][sS][eE]|[sS][eE][gG][mM][eE][nN][tT]|[sS][hH][iI][fF][tT]_[lL][eE][fF][tT]|[sS][hH][iI][fF][tT]_[rR][iI][gG][hH][tT]|[sS][uU][bB][sS][tT][rR][iI][nN][gG]|[sS][uU][bB][sS][tT][rR][iI][nN][gG]_[aA][fF][tT][eE][rR]|[sS][uU][bB][sS][tT][rR][iI][nN][gG]_[fF][rR][oO][mM]|[sS][uU][bB][sS][tT][rR][iI][nN][gG]_[bB][eE][fF][oO][rR][eE]|[sS][uU][bB][sS][tT][rR][iI][nN][gG]_[tT][oO]|[tT][oO]_[uU][pP][pP][eE][rR]|[tT][oO]_[lL][oO][wW][eE][rR]|[tT][oO]_[mM][iI][xX][eE][dB]|[fF][rR][oO][mM]_[mM][iI][xX][eE][dB]|[tT][rR][aA][nN][sS][lL][aA][tT][eE]|[xX][sS][tT][rR][lL][eE][nN]|[bB][iI][tT]-[sS][eE][tT]|[uU][tT][cC][lL][oO][nN][gG]_[cC][uU][rR][rR][eE][nN][tT]|[uU][tT][cC][lL][oO][nN][gG]_[aA][dB][dB]|[uU][tT][cC][lL][oO][nN][gG]_[dD][iI][fF][fF]|[lL][iI][nN][eE][sS]|[lL][iI][nN][eE]_[iI][nN][dB][eE][xX])$")
)



(string_template "\\" @string.escape )
(regex_spec (string_literal) @string.regexp )
(pcre_spec (string_literal) @string.regexp )

(open_dataset_statement file: (string_literal) @string.special.path )
(transfer_statement destination: (string_literal) @string.special.path )
(read_dataset_statement source: (string_literal) @string.special.path )
(get_dataset_statement file: (string_literal) @string.special.path )
(set_dataset_statement file: (string_literal) @string.special.path )
(truncate_dataset_statement subject: (string_literal) @string.special.path )
(delete_dataset_statement dataset: (string_literal) @string.special.path )
(close_dataset_statement dataset: (string_literal) @string.special.path )

(authority_check_statement auth_object: (string_literal) @string.special.symbol )
(call_function_statement name: (string_literal) @string.special.symbol )
(call_transaction_statement transaction: (string_literal) @string.special.symbol )
(leave_to_transaction_statement transaction: (string_literal) @string.special.symbol )
(receive_results_statement name: (string_literal) @string.special.symbol )
(id_field_spec id: (string_literal) @string.special.symbol )
(free_memory_statement id: (string_literal) @string.special.symbol )
(data_cluster_id_spec id: (string_literal) @string.special.symbol )

(delete_database_spec table: (identifier) @type)
(delete_shared_memory_spec table: (identifier) @type)
(delete_shared_buffer_spec table: (identifier) @type)
(import_from_database_spec table: (identifier) @type)

(delete_database_spec area: (identifier) @constant)
(delete_shared_memory_spec area: (identifier) @constant)
(delete_shared_buffer_spec area: (identifier) @constant)
(import_from_database_spec area: (identifier) @constant)

(export_data_cluster_parameter name: (identifier) @variable.parameter)
(import_data_cluster_parameter name: (identifier) @variable.parameter)
(data_cluster_parameter_table table: (identifier) @variable)
(export_data_buffer_spec destination: (identifier) @variable)
(import_data_buffer_spec source: (identifier) @variable)

(export_database_spec table: (identifier) @type)
(export_shared_memory_spec table: (identifier) @type)
(export_shared_buffer_spec table: (identifier) @type)
(import_database_spec table: (identifier) @type)
(import_shared_memory_spec table: (identifier) @type)
(import_shared_buffer_spec table: (identifier) @type)

(export_database_spec area: (identifier) @constant)
(export_shared_memory_spec area: (identifier) @constant)
(export_shared_buffer_spec area: (identifier) @constant)
(import_database_spec area: (identifier) @constant)
(import_shared_memory_spec area: (identifier) @constant)
(import_shared_buffer_spec area: (identifier) @constant)


(method_spec name: (identifier) @function.method ) 

; Could also be a data object but who on earth would do that..
(alias_spec alias: (identifier) @function.method )


(constructor_spec "constructor" @constructor )
(class_constructor_spec "class_constructor" @constructor )

; VARIABLES AND PROPERTIES
; ------------------------
; Due to the nature of the typing system, we cant just mark
; each identifier as variable globally and must scope them to
; more local expressions, like declarations or operations


; This helps a great deal marking basically all identifiers as variables
; where they are interchangable with other data-like expressions.
(name_reference/identifier) @variable
(_contextual_expression/identifier) @variable
(_character_position/identifier) @variable
((name_reference/identifier) @variable.builtin
  ( #match? @variable.builtin "^(([mM][eE])|([sS][uU][pP][eE][rR])|([sS][yY]))$"))

(assignment (identifier) @variable)
(calculation_assignment left: (identifier) @variable)

; Macro parameters
(
 (identifier) @variable.parameter
   (#any-of? @variable.parameter "&1" "&2" "&3" "&4" "&5" "&6" "&7" "&8" "&9" )
)

(dynamic_spec (identifier) @variable )
(dereference_expression subject: (identifier) @variable )
(substring_access (identifier) @variable )
(table_body_access (identifier) @variable )
(field_symbol name: (identifier) @variable )
(for_user_spec user: (identifier) @variable)
(id_field_spec field: (identifier) @variable)
(conv_expression subject: (identifier) @variable)
(replace_statement subject: (identifier) @variable)
(find_statement subject: (identifier) @variable)
(shift_statement subject: (identifier) @variable)
(convert_text_statement source: (identifier) @variable)
(convert_text_statement destination: (identifier) @variable)
(overlay_statement subject: (identifier) @variable)
(overlay_statement overlay: (identifier) @variable)
(only_spec mask: (identifier) @variable)
(translate_statement subject: (identifier) @variable)
(set_bit_statement position: (identifier) @variable)
(set_bit_statement subject: (identifier) @variable)
(set_bit_statement to: (identifier) @variable)
(get_bit_statement position: (identifier) @variable)
(get_bit_statement subject: (identifier) @variable)
(get_bit_statement into: (identifier) @variable)
(write_to_statement source: (identifier) @variable)
(write_to_statement destination: (identifier) @variable)
(format_unit_spec value: (identifier) @variable)
(get_reference_statement source: (identifier) @variable)
(tables_declaration (tables_spec name: (identifier) @variable ))
(accumulator_spec name: (identifier) @variable )


; Must be below dynamic spec due to module override
(form_definition name: (identifier) @function )
(subroutine_list (identifier) @function )

(perform_statement
  (subroutine_spec 
    name: (identifier) @function.call 
    [
      (in_program_spec name: (identifier) @module )
      program: (dynamic_spec (identifier) @module )
    ]?
  )
)

(declaration_expression (identifier) @variable )


(data_declaration 
  (data_spec name: (identifier) @variable )
)

(data_declaration 
  (begin_of_struct_spec name: (identifier) @variable )
)
(data_declaration 
  (end_of_struct_spec name: (identifier) @variable )
)

; Only outer declarations are variables; the enclosed declarations are members.
(data_declaration
  (begin_of_struct_spec)
  [
    (data_spec name: (identifier) @variable.member)
    (begin_of_struct_spec name: (identifier) @variable.member)
    (end_of_struct_spec name: (identifier) @variable.member)
  ]
  (end_of_struct_spec)
)

; Consecutive structure boundaries belong to separate top-level declarations.
(data_declaration
  (end_of_struct_spec name: (identifier) @variable)
  (begin_of_struct_spec name: (identifier) @variable)
)

(statics_declaration 
  (statics_spec name: (identifier) @variable )
)

(statics_declaration 
  (begin_of_struct_spec name: (identifier) @variable )
)
(statics_declaration 
  (end_of_struct_spec name: (identifier) @variable )
)

; Only outer declarations are variables; the enclosed declarations are members.
(statics_declaration
  (begin_of_struct_spec)
  [
    (statics_spec name: (identifier) @variable.member)
    (begin_of_struct_spec name: (identifier) @variable.member)
    (end_of_struct_spec name: (identifier) @variable.member)
  ]
  (end_of_struct_spec)
)

(statics_declaration
  (end_of_struct_spec name: (identifier) @variable)
  (begin_of_struct_spec name: (identifier) @variable)
)

(class_body
  (_ ; any section
    (data_declaration
      [
        (data_spec name: (identifier) @variable.member)
        (begin_of_struct_spec name: (identifier) @variable.member)
        (end_of_struct_spec name: (identifier) @variable.member)
      ]
    )
  )
)

(class_body
  (_ ; any section
    (class_data_declaration
      [
        (class_data_spec name: (identifier) @variable.member)
        (begin_of_struct_spec name: (identifier) @variable.member)
        (end_of_struct_spec name: (identifier) @variable.member)
      ]
    )
  )
)

; The component of a struct access is always a variable.member even in a type context.
(component_selection
  selector: ["-" "=>"]
  component: (identifier) @variable.member
)

(component_selection
  subject: (identifier)? @variable
  selector: "->"
  component: (identifier)? @variable.member
)

; TODO: This incorrectly tags in a typing context as well, are there
; some mental gymnastics we can do to prevent that? 
(component_selection
  subject: (identifier) @variable
  selector: "-"
)

(
 (component_selection
  subject: (identifier) @variable.builtin
  selector: "-" )
  ( #match? @variable.builtin "^([sS][yY])$" )
)


(table_key_definition_spec name: (identifier) @constant )
(free_key_spec name: (identifier) @constant )
(table_key_definition_spec ( key_alias_spec name: (identifier) @constant ) )
(using_key_spec name: (identifier) @constant )
(using_loop_key_spec "loop_key" @constant.builtin )
(table_key_spec name: (identifier) @constant )
(index_key_spec name: (identifier) @constant )
(checkpoint_id_spec group: (identifier) @constant )
(test_injection_statement name: (identifier) @constant )
(test_seam_statement name: (identifier) @constant )
(enhancement_statement name: (identifier) @constant )
(enhancement_point_statement name: (identifier) @constant )
(enhancement_section_statement name: (identifier) @constant )
(spots_spec (identifier) @constant )
(db_language_spec (identifier) @constant.builtin )
(db_system_spec (identifier) @constant.builtin )

(key_components_spec (identifier) @variable.member )
(group_key_component field: (identifier) @variable.member )
(mapping (identifier) @variable.member )
(lookup_mapping (identifier) @variable.member )
(except_list_spec (identifier) @variable.member )


; Parameter identifiers
(named_argument name: (identifier) @variable.parameter )
(filter_binding name: (identifier) @variable.parameter )

; Keep this after the generic capture so the CLI retains the match for its value capture.
(named_argument
  name: (identifier) @variable.parameter
  value: (string_literal) @string.regexp
  (#match? @variable.parameter "^([pP][cC][rR][eE]|[rR][eE][gG][eE][xX])$")
)

(implicit_reference name: (identifier) @variable.parameter )
(explicit_value name: (identifier) @variable.parameter )
(explicit_reference name: (identifier) @variable.parameter )
(preferred_parameter_spec name: (identifier) @variable.parameter )
(exception_mapping name: (identifier) @variable.parameter )
(exception_mapping name: (identifier) @variable.parameter.builtin (#eq? @variable.parameter.builtin "others") )


(exceptions (identifier) @variable.parameter )
(raising_exception_spec exception: (identifier) @variable.parameter )
(raise_statement name: (identifier) @variable.parameter )

(at_selscreen_statement
  event: [
    (on_help_request_spec (identifier) @variable.parameter )
    (on_parameter_spec (identifier) @variable.parameter )
    (on_value_request_spec (identifier) @variable.parameter )
    (on_end_of_parameter_spec (identifier) @variable.parameter )
    (on_radiobutton_group_spec (identifier) @constant )
    (on_block_spec (identifier) @constant )
  ]
)

(parameters_spec name: (identifier) @variable.parameter )
(include_parameter_directive_spec name: (identifier) @variable.parameter )
(select_options_spec name: (identifier) @variable.parameter )
(include_select_option_directive_spec name: (identifier) @variable.parameter )
(pushbutton_element_spec name: (identifier) @variable )
(include_pushbutton_directive_spec name: (identifier) @variable )
(user_command_spec (identifier) @constant )
(memory_id_spec (identifier) @constant )
(modif_id_spec (identifier) @constant )
(radiobutton_group_spec (identifier) @constant )
(default_value_spec (identifier) @constant )

(search_help_spec (identifier) @type )
(instance_of_predicate type: (identifier) @type )

; Regular block is technically a constant, but its difficult
; to disambiguate from an end of tabbed block
(begin_of_block_element_spec (identifier) @variable )
(include_block_directive_spec (identifier) @variable )
(tab_spec name: (identifier) @variable )
(begin_of_tabbed_block_element_spec (identifier) @variable )
(end_of_block_element_spec
  (end_of_block_spec name: (identifier) @variable ))

(comment_spec 
  [
    name: (identifier) @variable
    (for_screen_field_spec name: (identifier) @variable.parameter )
  ]
) 
(output_position_spec
  position: (identifier) @constant.builtin
)

(message_spec 
  type: (message_type)? @constant.builtin 
  id: (identifier)? @variable 
)

; CONSTANTS
((name_reference/identifier) @constant.builtin
  (#match? @constant.builtin "^([aA][bB][aA][pP]_(([tT][rR][uU][eE])|([fF][aA][lL][sS][eE])|([uU][nN][dD][eE][fF][iI][nN][eE][dD]))|([sS][pP][aA][cC][eE]))$" )
)
(text_symbol
  (string_literal)
  id: (symbol_id) @constant
) 

(text_symbol 
  (identifier) @constant.builtin
  id: (symbol_id) @variable.member 
) 

; Only for immediate declarations
; TODO: Wont work when it starts with a struct.
(constants_declaration 
  . (constants_spec name: (identifier) @constant )
  (constants_spec name: (identifier) @constant )?
)

(constants_declaration 
  (end_of_struct_spec name: (identifier) @constant ) .
)
(constants_declaration 
  . (begin_of_struct_spec name: (identifier) @constant )
)

; A chained structure may follow one or more immediate constants.
; Nested structure names are overridden as members by the next rule.
(constants_declaration
  (constants_spec)
  (begin_of_struct_spec name: (identifier) @constant)
)

(constants_declaration
  (begin_of_struct_spec)
  [
    (constants_spec name: (identifier) @variable.member)
    (begin_of_struct_spec name: (identifier) @variable.member)
    (end_of_struct_spec name: (identifier) @variable.member)
  ]
  (end_of_struct_spec)
)

(constants_declaration
  (end_of_struct_spec name: (identifier) @constant)
  (begin_of_struct_spec name: (identifier) @constant)
)

(component_selection 
    subject: [
      (identifier) @type 
      (component_selection
        component: (identifier) @type
      )
    ]
    selector: "~"
    component: (identifier) @variable.member
)

(method_implementation 
  name: [
    (identifier) @function.method
    (component_selection
      selector: "~"
      component: (identifier) @function.method
    )
  ]
)

(method_implementation 
  name: (identifier) @constructor
  (#any-of? @constructor "constructor" "class_constructor" )
)
(function_call 
  name: (identifier) @constructor
  (#eq? @constructor "constructor" )
)

; Any identifier inside a class declaration is an identifier
(class_declaration 
  name: (identifier) @type 
  (class_options 
    (_ (identifier) @type )
  )?
)

(interface_declaration name: (identifier) @type )

(local_friends_declaration (identifier) @type )
(deferred_class_declaration name: (identifier) @type )
(deferred_interface_declaration name: (identifier) @type )
(class_implementation name: (identifier) @type )
(for_scalar_function_spec name: (identifier) @type )
(for_table_function_spec name: (identifier) @type )
(using_entities_spec (identifier) @type )
(using_schema_spec (identifier) @type )
(schema_objects_spec (identifier) @type )

(non_resumable_exception_spec name: (identifier) @type )
(resumable_exception_spec name: (identifier) @type )
(new_exception_spec class_name: (identifier) @type )
(create_object_statement type: (identifier) @type )
(throw_exception name: (identifier) @type )
(catch_exception_list (identifier) @type )
(case_type_clause type: (identifier) @type )

(interfaces_spec 
  [
    name: (identifier) @type 
    (abstract_methods_spec
      [
        (identifier) @function.method
        (component_selection
          selector: "~"
          component: (identifier) @function.method
        )
      ]
    )
    (final_methods_spec
      [
        (identifier) @function.method
        (component_selection
          selector: "~"
          component: (identifier) @function.method
        )
      ]
    )
    (data_values_spec
      (data_value_assignment
        member: (identifier) @variable.member
      )

    )
  ]
)

(component_selection
  subject: (identifier) @type
  selector: "=>"
)

(for_event_spec
  [
	source: (identifier) @type
    name: (identifier) @constant
  ]
)

(method_spec
  (for_event_spec)
  importing: (parameters 
    (parameter
      (implicit_reference 
        name: (identifier) @variable.parameter.builtin
        ( #match? @variable.parameter.builtin "^[sS][eE][nN][dD][eE][rR]$" )
      )
    )
  )
)

(event_spec name: (identifier) @constant)

(raise_event_statement
  name: [
    (identifier) @constant
    (component_selection component: (identifier) @constant)
  ]
)

(raise_entity_event_statement
  event: (component_selection component: (identifier) @constant)
)

(mapping_type_spec name: (identifier) @type)
(mapping_like_spec object: (identifier) @variable)

(event_handler_list
  [
    (identifier) @function.method
    (component_selection component: (identifier) @function.method)
  ]
)

(using_entities_spec
  (component_selection component: (identifier) @function.method)
)


(transformation_name_spec name: (identifier) @function.call)

[
  (transformation_parameter_binding_spec
    name: (identifier) @variable.parameter)
  (source_binding_spec
    name: (identifier) @variable.parameter)
  (result_binding_spec
    name: (identifier) @variable.parameter)
]


(function_call
  source: [
      (identifier) @type 
      (component_selection
        component: (identifier) @type
      )
  ] 
  ["~" "=>"]
)

(function_call
  source: (identifier) @variable
  "->"
)

(call_method_statement
  name: [
    (component_selection component: (identifier) @function.method )
    (identifier) @function.method
  ]
)

(call_badi_statement
  name: (component_selection component: (identifier) @function.method )
)

; WARN: We need some way to ensure that this doesnt tag variables in
; 'like' expressions, so the grammar must map those as 'object'
(_ typing: (_ object: (identifier) @variable ))
(_ typing: (_ (identifier) @type !object ))
(_ typing: (_ (identifier) @type.builtin !object 
  (#match? @type.builtin "^([bBcCdDfFiInNpPsStTxX]|[dD][eE][cC][fF][lL][oO][aA][tT]16|[dD][eE][cC][fF][lL][oO][aA][tT]34|[iI][nN][tT]8|[sS][tT][rR][iI][nN][gG]|[uU][tT][cC][lL][oO][nN][gG]|[xX][sS][tT][rR][iI][nN][gG]|[aA][nN][yY])$")
))

; Constructor results
(_ [ result_type: (identifier) base_type: (identifier) ] @type )
(_ [ result_type: (identifier) base_type: (identifier) ] @type.builtin
  (#match? @type.builtin "^([bBcCdDfFiInNpPsStTxX]|[dD][eE][cC][fF][lL][oO][aA][tT]16|[dD][eE][cC][fF][lL][oO][aA][tT]34|[iI][nN][tT]8|[sS][tT][rR][iI][nN][gG]|[uU][tT][cC][lL][oO][nN][gG]|[xX][sS][tT][rR][iI][nN][gG]|[aA][nN][yY])$")
)


; Must be more specific than the variable rule so it takes precedence. 
; No choice but to support up to a certain depth (3)
(_ typing: (_ 
  !object
  (component_selection 
    subject: [
      (identifier) @type
      (component_selection
        subject: [
          (identifier) @type
          (component_selection
              subject: (identifier) @type
              selector: "-"
          )
        ]
        selector: "-"
      )
    ]
    selector: "-"
)))

; To tag the component, not the subject. Either the subject is another
; chained expression, in which case we descend, or its an identifier
; in which case the immediate component is the type
(types_spec typing: (_
    [
     (component_selection 
       subject: [
         (component_selection 
           subject:
             (component_selection
               subject: (identifier) @type
               selector: "=>"
               component: (identifier) @type )
         )
         (component_selection
           subject: (identifier) @type
           selector: "=>"
           component: (identifier) @type )
        ]
      )
     (component_selection
       subject: (identifier) @type
       selector: "=>"
       component: (identifier) @type )
    ]
))

; Make sure not to overlap with what was previously matched as class / interface
(ref_to 
  [
    subject: (identifier) @type
    object: (identifier) @variable
  ]
)

; Chained declarations can contain structures alongside other type declarations.
; Capture declarations as definitions first; the structure rule below overrides members.
(types_declaration
  (types_spec name: (identifier) @type.definition ) )

(types_declaration
  (begin_of_struct_spec name: (identifier) @type.definition )
)
(types_declaration
  (end_of_struct_spec name: (identifier) @type.definition )
)

; NOTE: Do not try to integrate anchor tags.
; Works in the playground and neovim, but the CLI highlighter seems
; to have some issue with it making it fail the tests.
(types_declaration
  (begin_of_struct_spec)
  [
    (types_spec name: (identifier) @variable.member)
    (begin_of_struct_spec name: (identifier) @variable.member)
    (end_of_struct_spec name: (identifier) @variable.member)
  ]
  (end_of_struct_spec)
)

(types_declaration
  (end_of_struct_spec name: (identifier) @type.definition)
  (begin_of_struct_spec name: (identifier) @type.definition)
)

; RAP derived types
(business_object/identifier) @type
(composition_navigation 
  source: (identifier)? @type
  "\\\\" @operator
  composition: (identifier) @type )

(association_navigation 
  source: (identifier)? @type 
  "\\" @operator
  association: (identifier) @type )

(fields_spec (identifier) @variable.member)
(deep_entity_fields (identifier) @variable.member)

[
  (execute_action
    name: (identifier) @function.method)
  (execute_function
    name: (identifier) @function.method)
]

(method_spec
  (rap_handler_for_spec)
  changing: (parameters
    (parameter
      [ 
        (implicit_reference name: (identifier) @variable.parameter.builtin )
        (explicit_reference name: (identifier) @variable.parameter.builtin )
      ]
    )
  )
  (#any-of? @variable.parameter.builtin "failed" "mapped" "reported" )
)


; Tables / structs are always field assignments, not parameters.
; Up to 3 levels of nesting supported for deep component assignments.
(table_comprehension
  (named_argument
    name: (identifier) @variable.member
  )
)

(line_spec
  (argument_list
    (named_argument
      name: [
        (identifier) @variable.member
        (component_selection 
          subject: [
            (identifier) @variable.member
            (component_selection 
              subject: [
                (identifier) @variable.member
              ]
              selector: "-"
            )
          ]
          selector: "-"
        )
      ]
    )
  )
)

; In new expressions, they are MOST LIKELY params. 
; But in value expressions we can be sure its fields.
(value_expression
  (argument_list
    (named_argument
      name: [
        (identifier) @variable.member
        (component_selection 
          subject: [
            (identifier) @variable.member
            (component_selection 
              subject: [
                (identifier) @variable.member
              ]
              selector: "-"
            )
          ]
          selector: "-"
        )
      ]
    )
  )
)

(itab_comp/identifier) @variable.member
(itab_comp/component_selection
  subject: (identifier) @variable.member
  selector: ["-" "->"]
  component: (identifier) @variable.member ; for some reason the tests fail without...
) 

(itab_comp/substring_access
  subject: (identifier) @variable.member
) 

(begin_of_enum_spec name: (identifier) @type.definition )
(enum_value_spec name: (identifier) @constant )
(end_of_enum_spec name: (identifier) @type.definition )
(enum_structure_spec name: (identifier) @constant )

; In this context, table kind keywords specify a generic type.
(typing/table_type
  kind: (_ keyword: _ @type.builtin ) .
)


(include_statement
  name: (identifier) @module
)

(report_statement
  name: (identifier) @module
  (default_message_class_spec name: (identifier) @type )?
  (defining_database_spec name: (identifier) @type )?
)

(submit_statement report: (identifier) @module)

(program_statement
  name: (identifier) @module
  (default_message_class_spec name: (identifier) @type )?
)

(function_pool_statement
  name: (identifier) @module
  (default_message_class_spec name: (identifier) @type )?
)

(function_definition name: (identifier) @module )
(module_definition name: (identifier) @module )
(macro_definition name: (identifier) @function.macro )
(macro_include name: (identifier) @function.macro )


; ABAP SQL
(from_database_source_spec (identifier) @type )
(sql_data_source source: (identifier) @type)
(sql_function_call name: (identifier) @function.call)
(sql_cast_type name: (identifier) @type.builtin)
(sql_null) @constant.builtin
(sql_column_spec/identifier) @variable.member
(qualified_field
  source: (identifier) @type
  target: (identifier)? @variable.member
)
(sql_path_element
  source: (identifier)? @type
  component: (identifier) @variable.member)
(sql_path_association
  "\\" @operator
  association: (identifier) @type)
(with_association_path source: (identifier) @type)
(association_alias_spec alias: (identifier) @type)
(association_redirected_to_spec target: (identifier) @type)
(sql_source_alias_spec alias: (identifier) @type)
(sql_field_alias_spec alias: (identifier) @variable.member)
(sql_set_order_by_field column: (identifier) @variable.member)
(cte_name name: (identifier) @type)
(cte_field_list (identifier) @variable.member)
(view_argument name: (identifier) @variable.parameter)
(sql_database_hint database: (identifier) @constant)
(clients_in source: (identifier) @type)
(connection_spec connection: (identifier) @constant)
(sql_host_variable "@" @punctuation.special)
(sql_host_expression "@" @punctuation.special)
(sql_operand_list (identifier) @variable.member)




; ------------------------------------------
; ABAP Doc tags, links, etc.
; ------------------------------------------
(docstring) @comment.documentation

(doctag
  (tag) @keyword.directive
  (#any-of? @keyword.directive "@parameter" "@exception")
  value: (identifier) @variable.parameter)

(doctag
  (tag) @keyword.directive
  (#any-of? @keyword.directive "@raising" "@testing")
  value: (identifier)? @type)

; Custom tags e.g. @brief that are just followed by documentation
(doctag 
  (tag) @keyword.directive  
  (#not-any-of? @keyword.directive "@parameter" "@exception" "@raising" "@testing" )
)
(doclink "@link" @keyword.directive )

; METH for methods
(linked_node
  (linked_object_kind) @keyword.directive
  (#match? @keyword.directive "[Mm][Ee][Tt][Hh]")
  (identifier) @function.method
)

; DATA for constants, variables, and procedure parameters in the appropriate context
(linked_node
	(linked_object_kind) @keyword.directive
  (#match? @keyword.directive "[Dd][Aa][Tt][Aa]")
  (identifier) @variable
)


; No kind: is specified so the identifier is ambiguous. It could be
; a data element, global class / interface or a CDs entity.
; Could take a guess by looking at the prefix?
(linked_node
	(linked_object_kind) @keyword.directive
  (#not-match? @keyword.directive "([Mm][Ee][Tt][Hh])|([dD][aA][tT][aA])")
  (identifier) @type
)
(linked_node
  !kind
  (identifier) @type
)

[ "." "," ":" ] @punctuation.delimiter
[ "(" ")" "[" "]" "[]" ] @punctuation.bracket
[ "{" "}" ] @punctuation.special

; ------------------------------------------
; Operators
; ------------------------------------------
[   
    "="
    "-"
    "=>"
    ">="
    "->"
    "+"
    "="
    "~"
    "*"
    "/"
  	"**"
    "->*"
    "#"
    "&&"
    "!"
    "<>"
    "<="
    ">"
    "<"
    "+="
    "-="
    "*="
    "/="
    "?="
    "&&="
    "mod"
    "div"
] @operator


(logical_expression
  [     
    "and"
    "or"
    "equiv"
    "not"
  ] @keyword.operator
)

(comparison_expression
  [
    "eq"
    "ne"
    "gt"
    "lt"
    "ge"
    "le"
    "co"
    "cn"
    "ca"
    "na"
    "cs"
    "ns"
    "cp"
    "np"
    "byte-co"
    "byte-cn"
    "byte-ca"
    "byte-na"
    "byte-cs"
    "byte-ns"
    "o"
    "z"
    "m"
] @keyword.operator )

(bit_expression
  [
    "bit-not"
    "bit-and"
    "bit-xor"
    "bit-or"
  ] @keyword.operator
)

[
	  "return"
	  "exit"
    "check"
] @keyword.return

[
    "continue"
    "endat"
] @keyword.repeat

[
    "resume"
] @keyword.exception

[
    (final)
    (abstract)
    (public)
] @keyword.modifier

(parameter (optional) @keyword.modifier )
(explicit_value "value" @keyword.modifier )
(explicit_reference "reference" @keyword.modifier )
(resumable_exception_spec "resumable" @keyword.modifier )

(public_section keyword: _ @keyword.modifier )
(protected_section keyword: _ @keyword.modifier )
(private_section keyword: _ @keyword.modifier )

(class_declaration "class" @keyword.type )
(interface_declaration "interface" @keyword.type )

(include_statement "include" @keyword.import )
(methods_declaration "methods" @keyword.function ) 
(class_methods_declaration "class-methods" @keyword.function ) 

; I wanna be careful cause these keywords may appear in other context?
; Like in a parameters decl, I feel like resumable should not be tagged
(raise_exception_statement ["raise" "exception" ] @keyword.exception )
(raise_shortdump_statement ["raise" "shortdump" ] @keyword.exception )
(raise_statement ["raise" ] @keyword.exception )
(resumable "resumable" @keyword.exception )
(try_statement ["try" "endtry" ] @keyword.exception )
(catch_clause ["catch" ] @keyword.exception )
(before_unwind ["before" "unwind" ] @keyword.exception )
(cleanup_clause "cleanup" @keyword.exception )

(assert_statement "assert" @keyword.debug )
(breakpoint_statement "break-point" @keyword.debug )
(logpoint_statement "log-point" @keyword.debug )

(if_statement [ "if" "endif" ] @keyword.conditional )
(elseif_clause "elseif" @keyword.conditional)
(else_clause "else" @keyword.conditional)

(case_statement ["case" "endcase"] @keyword.conditional )
(case_clause "when" @keyword.conditional)
(others_case_clause [ "when" "others" ] @keyword.conditional )

(case_type_of_statement ["case" "type" "of" "endcase" ] @keyword.conditional )
(case_type_clause [ "when" "type" ] @keyword.conditional )

(do_statement ["do" "times" "enddo"  ] @keyword.repeat )
(while_statement ["while" "endwhile" ] @keyword.repeat )

(loop_at_statement ["loop" "at" "endloop" ] @keyword.repeat )
(at_first_statement ["at" "first"] @keyword.repeat )
(at_last_statement ["at" "last"] @keyword.repeat )
(at_new_statement ["at" "new"] @keyword.repeat )
(at_end_of_statement ["at" "end" "of"] @keyword.repeat )


(format_option name: (identifier) @variable.parameter.builtin )

(asynchronous_callback_spec
  [
    method: [
      (component_selection component: (identifier) @function.method)
      (identifier) @function.method
    ]
  routine: (identifier) @function.subroutine
  ]
)
