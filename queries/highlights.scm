(string_literal) @string
(string_template) @string
(number) @number

[
   (inline_comment)
   (line_comment)
   (multi_line_comment)
] @comment

[
   (pragma)
   (pseudo_comment)
] @comment.pragma

; ------------------------------------------
; Class identifiers, ambiguity exists.
; ------------------------------------------
(class_component_selector class: (identifier) @class )
(deferred_class_definition name: (identifier) @class )
(class_definition name: (identifier) @class )
(class_implementation name: (identifier) @class )

(simple_exception_spec name: (identifier) @class )
(resumable_exception_spec name: (identifier) @class )
(new_exception_spec class_name: (identifier) @class )
(catch_exception_list (identifier) @class )

(superclass_spec name: (identifier) @class)
(for_event_spec 
  [
	source: (identifier) @class
    name: (identifier) @variable.event
  ]
)

; Ambiguous case, its also possible to have a ref to a datatype
; but in most cases it should be a class.
(ref_type_spec name: (type_identifier) @class )

; ------------------------------------------
; Interface identifiers, ambiguity exists.
; ------------------------------------------
(deferred_interface_definition name: (identifier) @interface )
(interfaces_declaration (identifier) @interface )
(interface_definition name: (identifier) @interface )

; The component could literally be anything, we have no idea,
; but in 90% of cases it should be a method..
(interface_component_selector 
	intf: (identifier) @interface
	comp: (identifier) @function.method
 )
 
; ------------------------------------------
; Method identifiers, ambiguity exists.
; ------------------------------------------
(builtin_function_call (identifier) @function.builtin )
(method_spec name: (identifier) @function.method ) 
(method_call name: (identifier) @function.method )
(method_implementation name: (identifier) @function.method )

; Could also be a data object but who on earth would do that..
(alias_spec alias: (identifier) @function.method )

(function_call 
  callback_method: [
    (object_component_selector comp: (identifier) @function.method)
    (class_component_selector  comp: (identifier) @function.method)
    (identifier) @function.method
  ]
  callback_routine: (identifier) @function.subroutine
)

(form_definition name: (identifier) @function.subroutine )
(subroutine_spec name: (identifier) @function.subroutine )
(subroutine_list (identifier) @function.subroutine )

; For all other variants, there is no method to be highlighted since
; it is specified via a literal string or a data object
(dynamic_method_spec
  [
    (class_component_selector comp: (identifier) @function.method )
    (object_component_selector comp: (identifier) @function.method )
    (identifier) @function.method
  ]
)

(constructor_spec
  [
    (keyword_constructor)
    (keyword_class_constructor)
  ] @function.constructor
)

; ------------------------------------------
; Variable identifiers
; ------------------------------------------
[ 
  (struct_component_selector)
  (object_component_selector)
  (class_component_selector)
  (itab_comp_spec)
] comp: (identifier) @variable.property 

(key_components (identifier) @variable.property )

[
  (value_param_spec)
  (simple_param_spec)
  (reference_param_spec)
  (preferred_param_spec)
] name: (identifier) @variable.parameter

(table_key_spec name: (identifier) @variable.key )
(using_key_spec name: (identifier) @variable.key )

(exception_list (identifier) @variable.exception )
(message_spec raising: (identifier) @variable.exception )
(raise_statement name: (identifier) @variable.exception )

(message_spec type: (message_type) @variable.messagetype )


; ------------------------------------------
; General type identifiers (if not specified elsewhere)
; ------------------------------------------
(type_identifier) @type
(builtin_type_spec) @type.builtin

; ------------------------------------------
; ABAP Doc tags, links, etc.
; ------------------------------------------
(doctag
  (tag) @abapdoc.tag
  (#match? @abapdoc.tag "@parameter")
  name: (identifier) @variable.param)

(doctag
  (tag) @abapdoc.tag
  (#eq? @abapdoc.tag "@raising")
  name: (identifier) @class)

(doctag
  (tag) @abapdoc.tag
  (#eq? @abapdoc.tag "@exception")
  name: (identifier) @variable.exception)

(doctag (tag) @abapdoc.tag )
(doclink "@link" @abapdoc.tag )

; METH for methods
(linked_node
	(linked_object_kind) @abapdoc.kind
    (#match? @abapdoc.kind "[Mm][Ee][Tt][Hh]")
    (identifier) @function.method
)

; DATA for constants, variables, and procedure parameters in the appropriate context
(linked_node
	(linked_object_kind) @abapdoc.kind
    (#match? @abapdoc.kind "[Dd][Aa][Tt][Aa]")
    (identifier) @variable
)

(docstring) @abapdoc

; No kind: is specified so the identifier is ambiguous. It could be
; a data element, global class / interface or a CDs entity.
; Could take a guess by looking at the prefix?
(linked_node
    (identifier) @type
)

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
    "&&="
    "[]"
    
] @operator

; ------------------------------------------
; Delimiters
; ------------------------------------------
[
	":"
    "."
    ","
    "("
    ")"
    "["
    "]"
    "{"
    "}"
    "~"
] @delimiter

; ------------------------------------------
; Control Flow keywords
; ------------------------------------------
; For alot of keywords, the context matters. E.g "FOR" 
; is a control keyword in a for loop, but not in
; the combination of regular keywords "FOR TESTING"

(if_statement [(keyword_if) (keyword_endif)] @keyword.control)
(elseif_clause (keyword_elseif) @keyword.control)
(else_clause (keyword_else) @keyword.control)

(case_statement [(keyword_case) (keyword_endcase)] @keyword.control)
(case_clause (keyword_when) @keyword.control)
(others_case_clause [(keyword_when) (keyword_others)] @keyword.control)

(case_type_of_statement [(keyword_case) (keyword_type) (keyword_of) (keyword_endcase)] @keyword.control)
(case_type_clause [(keyword_when) (keyword_type)] @keyword.control)
(case_others_type_clause [(keyword_when) (keyword_others)] @keyword.control)

(do_statement [(keyword_do) (keyword_times) (keyword_enddo)] @keyword.control)
(while_statement [(keyword_while) (keyword_endwhile)] @keyword.control)
(try_statement [(keyword_try) (keyword_endtry)] @keyword.control)
(catch_clause [(keyword_catch) (keyword_before) (keyword_unwind)] @keyword.control)
(cleanup_clause (keyword_cleanup) @keyword.control)

(loop_at_statement [(keyword_loop) (keyword_at) (keyword_endloop)] @keyword.control)
(at_first_statement [(keyword_at) (keyword_first)] @keyword.control)
(at_last_statement [(keyword_at) (keyword_last)] @keyword.control)
(at_new_statement [(keyword_at) (keyword_new)] @keyword.control)
(at_end_of_statement [(keyword_at) (keyword_end) (keyword_of)] @keyword.control)

(raise_exception_statement [(keyword_raise) (keyword_exception)] @keyword.control)
(resumable_spec (keyword_resumable) @keyword.control)

[
  (keyword_return)
  (keyword_exit)
  (keyword_check)
  (keyword_continue)
  (keyword_resume)
  (keyword_endat)
] @keyword.control

; ------------------------------------------
; Keywords
; ------------------------------------------
[
  (keyword_data)
  (keyword_final)
  (keyword_constants)
  (keyword_type)
  (keyword_types)
  (keyword_aliases)
  (keyword_class_data)
  (keyword_ref)
  (keyword_to)
  (keyword_like)
  (keyword_value)
  (keyword_length)
  (keyword_decimals)
  (keyword_is)
  (keyword_initial)
  (keyword_read_only)
  (keyword_begin)
  (keyword_end)
  (keyword_of)
  (keyword_lines)
  (keyword_let)
  (keyword_in)
  (keyword_until)
  (keyword_table)
  (keyword_size)
  (keyword_standard)
  (keyword_sorted)
  (keyword_hashed)
  (keyword_unique)
  (keyword_non_unique)
  (keyword_index)
  (keyword_any)
  (keyword_occurs)
  (keyword_header)
  (keyword_line)
  (keyword_empty)
  (keyword_report)
  (keyword_no)
  (keyword_page)
  (keyword_heading)
  (keyword_line_size)
  (keyword_line_count)
  (keyword_defining)
  (keyword_database)
  (keyword_reduced)
  (keyword_functionality)
  (keyword_message_id)
  (keyword_range)
  (keyword_mod)
  (keyword_div)
  (keyword_new)
  (keyword_switch)
  (keyword_replace)
  (keyword_with)
  (keyword_verbatim)
  (keyword_replacement)
  (keyword_concatenate)
  (keyword_into)
  (keyword_separated)
  (keyword_by)
  (keyword_respecting)
  (keyword_ignoring)
  (keyword_case)
  (keyword_blanks)
  (keyword_find)
  (keyword_first)
  (keyword_occurrence)
  (keyword_all)
  (keyword_occurrences)
  (keyword_section)
  (keyword_offset)
  (keyword_byte)
  (keyword_character)
  (keyword_mode)
  (keyword_pcre)
  (keyword_match)
  (keyword_count)
  (keyword_results)
  (keyword_submatches)
  (keyword_shift)
  (keyword_places)
  (keyword_up)
  (keyword_left)
  (keyword_right)
  (keyword_circular)
  (keyword_deleting)
  (keyword_leading)
  (keyword_trailing)
  (keyword_split)
  (keyword_at)
  (keyword_condense)
  (keyword_no_gaps)
  (keyword_base)
  (keyword_key)
  (keyword_components)
  (keyword_class)
  (keyword_definition)
  (keyword_create)
  (keyword_public)
  (keyword_protected)
  (keyword_private)
  (keyword_inheriting)
  (keyword_from)
  (keyword_abstract)
  (keyword_global)
  (keyword_local)
  (keyword_friends)
  (keyword_shared)
  (keyword_memory)
  (keyword_enabled)
  (keyword_for)
  (keyword_behavior)
  (keyword_testing)
  (keyword_risk)
  (keyword_level)
  (keyword_harmless)
  (keyword_medium)
  (keyword_critical)
  (keyword_duration)
  (keyword_short)
  (keyword_long)
  (keyword_implementation)
  (keyword_deferred)
  (keyword_endclass)
  (keyword_interface)
  (keyword_interfaces)
  (keyword_endinterface)
  (keyword_methods)
  (keyword_method)
  (keyword_endmethod)
  (keyword_class_methods)
  (keyword_importing)
  (keyword_exporting)
  (keyword_changing)
  (keyword_returning)
  (keyword_receiving)
  (keyword_reference)
  (keyword_raising)
  (keyword_exceptions)
  (keyword_default)
  (keyword_optional)
  (keyword_preferred)
  (keyword_parameter)
  (keyword_resumable)
  (keyword_redefinition)
  (keyword_fail)
  (keyword_ignore)
  (keyword_event)
  (keyword_cond)
  (keyword_then)
  (keyword_else)
  (keyword_conv)
  (keyword_exact)
  (keyword_cast)
  (keyword_step)
  (keyword_delete)
  (keyword_corresponding)
  (keyword_appending)
  (keyword_deep)
  (keyword_discarding)
  (keyword_duplicates)
  (keyword_mapping)
  (keyword_except)
  (keyword_using)
  (keyword_throw)
  (keyword_filter)
  (keyword_where)
  (keyword_reduce)
  (keyword_init)
  (keyword_next)
  (keyword_and)
  (keyword_or)
  (keyword_equiv)
  (keyword_message)
  (keyword_id)
  (keyword_number)
  (keyword_display)
  (keyword_call)
  (keyword_function)
  (keyword_tables)
  (keyword_remote)
  (keyword_session)
  (keyword_destination)
  (keyword_starting)
  (keyword_task)
  (keyword_group)
  (keyword_parameter_table)
  (keyword_exception_table)
  (keyword_performing)
  (keyword_calling)
  (keyword_on)
  (keyword_background)
  (keyword_update)
  (keyword_as)
  (keyword_separate)
  (keyword_unit)
  (keyword_form)
  (keyword_endform)
  (keyword_structure)
  (keyword_perform)
  (keyword_program)
  (keyword_found)
  (keyword_rollback)
  (keyword_commit)
  (keyword_assigning)
  (keyword_field_symbol)
  (keyword_transporting)
  (keyword_fields)
  (keyword_without)
  (keyword_members)
  (keyword_ascending)
  (keyword_descending)
  (keyword_text)
  (keyword_set)
  (keyword_work)
  (keyword_wait)
  (keyword_include)
  (keyword_clear)
  (keyword_free)
  (keyword_parameters)
  (keyword_select_options)
  (keyword_modif)
  (keyword_obligatory)
  (keyword_checkbox)
  (keyword_radiobutton)
  (keyword_listbox)
  (keyword_visible)
  (keyword_user_command)
  (keyword_matchcode)
  (keyword_object)
  (keyword_no_display)
  (keyword_lower)
  (keyword_intervals)
  (keyword_no_extension)
  (keyword_off)
  (keyword_option)
  (keyword_sign)
  (keyword_selection_screen)
  (keyword_skip)
  (keyword_block)
  (keyword_uline)
  (keyword_screen)
  (keyword_subscreen)
  (keyword_nesting)
  (keyword_title)
  (keyword_window)
  (keyword_frame)
  (keyword_comment)
  (keyword_field)
  (keyword_pushbutton)
  (keyword_position)
  (keyword_tabbed)
  (keyword_tab)
  (keyword_blocks)
  (keyword_ending)
  (keyword_selection_set)
  (keyword_not)
  (keyword_bound)
  (keyword_instance)
  (keyword_assigned)
  (keyword_supplied)
  (keyword_adjacent)
  (keyword_comparing)
  (keyword_read)
  (keyword_binary)
  (keyword_search)
  (keyword_unassign)
  (keyword_eq)
  (keyword_ne)
  (keyword_gt)
  (keyword_lt)
  (keyword_ge)
  (keyword_le)
  (keyword_co)
  (keyword_cn)
  (keyword_ca)
  (keyword_na)
  (keyword_cs)
  (keyword_ns)
  (keyword_cp)
  (keyword_np)
  (keyword_bt)
  (keyword_nb)
  (keyword_byte_co)
  (keyword_byte_cn)
  (keyword_byte_ca)
  (keyword_byte_na)
  (keyword_byte_cs)
  (keyword_byte_ns)
] @keyword
(format_option parameter: (identifier) @keyword )

; Other identifiers not yet specified
(identifier) @variable