(string_literal) @string
(string_template) @string
(number) @number

; Keywords are aliased to anonymous snake_cased literal representations.
; This alone would not allow us to query them. For that reason, they are
; tagged with a keyword field. That gives us more control, as some keywords 
; can overlap with other tokens. See the table_type capture for instance.
; Bonus points for not having to maintain a huge alternation of literals :)
(_ keyword: _ @keyword)

[
   (inline_comment)
   (line_comment)
   (multi_line_comment)
] @comment

[
   (pragma)
   (pseudo_comment)
] @keyword.directive



; ------------------------------------------
; Method identifiers, ambiguity exists.
; ------------------------------------------
(function_call 
  name: (identifier) @function.builtin
  (#match? @function.builtin "^([bB][oO][oO][lL][cC]|[bB][oO][oO][lL][xX]|[xX][sS][dB][bB][oO][oO][lL]|[cC][oO][nN][tT][aA][iI][nN][sS]|[cC][oO][nN][tT][aA][iI][nN][sS]_[aA][nN][yY]_[oO][fF]|[cC][oO][nN][tT][aA][iI][nN][sS]_[aA][nN][yY]_[nN][oO][tT]_[oO][fF]|[mM][aA][tT][cC][hH][eE][sS]|[lL][iI][nN][eE]_[eE][xX][iI][sS][tT][sS]|[aA][bB][sS]|[cC][eE][iI][lL]|[fF][lL][oO][oO][rR]|[fF][rR][aA][cC]|[sS][iI][gG][nN]|[tT][rR][uU][nN][cC]|[iI][pP][oO][wW]|[nN][mM][aA][xX]|[nN][mM][iI][nN]|[aA][cC][oO][sS]|[aA][sS][iI][nN]|[aA][tT][aA][nN]|[cC][oO][sS]|[sS][iI][nN]|[tT][aA][nN]|[cC][oO][sS][hH]|[sS][iI][nN][hH]|[tT][aA][nN][hH]|[eE][xX][pP]|[lL][oO][gG]|[lL][oO][gG]10|[sS][qQ][rR][tT]|[rR][oO][uU][nN][dB]|[rR][eE][sS][cC][aA][lL][eE]|[gG][aA][mM][mM][aA]|[lL][oO][gG]_[gG][aA][mM][mM][aA]|[gG][aA][mM][mM][aA]_[lL][oO][wW][eE][rR]|[fF][aA][cC][tT][oO][rR][iI][aA][lL]|[bB][iI][nN][oO][mM][iI][aA][lL]|[eE][rR][fF]|[eE][rR][fF][cC]|[eE][rR][fF]_[iI][nN][vV]|[eE][rR][fF][cC]_[iI][nN][vV]|[cC][hH][aA][rR][lL][eE][nN]|[dD][bB][mM][aA][xX][lL][eE][nN]|[nN][uU][mM][oO][fF][cC][hH][aA][rR]|[sS][tT][rR][lL][eE][nN]|[cC][hH][aA][rR]_[oO][fF][fF]|[cC][mM][aA][xX]|[cC][mM][iI][nN]|[cC][oO][uU][nN][tT]|[cC][oO][uU][nN][tT]_[aA][nN][yY]_[oO][fF]|[cC][oO][uU][nN][tT]_[aA][nN][yY]_[nN][oO][tT]_[oO][fF]|[dD][iI][sS][tT][aA][nN][cC][eE]|[cC][oO][nN][dB][eE][nN][sS][eE]|[cC][oO][nN][cC][aA][tT]_[lL][iI][nN][eE][sS]_[oO][fF]|[eE][sS][cC][aA][pP][eE]|[fF][iI][nN][dB]|[fF][iI][nN][dB]_[eE][nN][dB]|[fF][iI][nN][dB]_[aA][nN][yY]_[oO][fF]|[fF][iI][nN][dB]_[aA][nN][yY]_[nN][oO][tT]_[oO][fF]|[iI][nN][sS][eE][rR][tT]|[mM][aA][tT][cC][hH]|[rR][eE][pP][eE][aA][tT]|[rR][eE][pP][lL][aA][cC][eE]|[rR][eE][vV][eE][rR][sS][eE]|[sS][eE][gG][mM][eE][nN][tT]|[sS][hH][iI][fF][tT]_[lL][eE][fF][tT]|[sS][hH][iI][fF][tT]_[rR][iI][gG][hH][tT]|[sS][uU][bB][sS][tT][rR][iI][nN][gG]|[sS][uU][bB][sS][tT][rR][iI][nN][gG]_[aA][fF][tT][eE][rR]|[sS][uU][bB][sS][tT][rR][iI][nN][gG]_[fF][rR][oO][mM]|[sS][uU][bB][sS][tT][rR][iI][nN][gG]_[bB][eE][fF][oO][rR][eE]|[sS][uU][bB][sS][tT][rR][iI][nN][gG]_[tT][oO]|[tT][oO]_[uU][pP][pP][eE][rR]|[tT][oO]_[lL][oO][wW][eE][rR]|[tT][oO]_[mM][iI][xX][eE][dB]|[fF][rR][oO][mM]_[mM][iI][xX][eE][dB]|[tT][rR][aA][nN][sS][lL][aA][tT][eE]|[xX][sS][tT][rR][lL][eE][nN]|[bB][iI][tT]-[sS][eE][tT]|[uU][tT][cC][lL][oO][nN][gG]_[cC][uU][rR][rR][eE][nN][tT]|[uU][tT][cC][lL][oO][nN][gG]_[aA][dB][dB]|[uU][tT][cC][lL][oO][nN][gG]_[dD][iI][fF][fF]|[lL][iI][nN][eE][sS]|[lL][iI][nN][eE]_[iI][nN][dB][eE][xX])$")
)

(function_call 
  name: (identifier) @function.method
  (#not-match? @function.method "^([bB][oO][oO][lL][cC]|[bB][oO][oO][lL][xX]|[xX][sS][dB][bB][oO][oO][lL]|[cC][oO][nN][tT][aA][iI][nN][sS]|[cC][oO][nN][tT][aA][iI][nN][sS]_[aA][nN][yY]_[oO][fF]|[cC][oO][nN][tT][aA][iI][nN][sS]_[aA][nN][yY]_[nN][oO][tT]_[oO][fF]|[mM][aA][tT][cC][hH][eE][sS]|[lL][iI][nN][eE]_[eE][xX][iI][sS][tT][sS]|[aA][bB][sS]|[cC][eE][iI][lL]|[fF][lL][oO][oO][rR]|[fF][rR][aA][cC]|[sS][iI][gG][nN]|[tT][rR][uU][nN][cC]|[iI][pP][oO][wW]|[nN][mM][aA][xX]|[nN][mM][iI][nN]|[aA][cC][oO][sS]|[aA][sS][iI][nN]|[aA][tT][aA][nN]|[cC][oO][sS]|[sS][iI][nN]|[tT][aA][nN]|[cC][oO][sS][hH]|[sS][iI][nN][hH]|[tT][aA][nN][hH]|[eE][xX][pP]|[lL][oO][gG]|[lL][oO][gG]10|[sS][qQ][rR][tT]|[rR][oO][uU][nN][dB]|[rR][eE][sS][cC][aA][lL][eE]|[gG][aA][mM][mM][aA]|[lL][oO][gG]_[gG][aA][mM][mM][aA]|[gG][aA][mM][mM][aA]_[lL][oO][wW][eE][rR]|[fF][aA][cC][tT][oO][rR][iI][aA][lL]|[bB][iI][nN][oO][mM][iI][aA][lL]|[eE][rR][fF]|[eE][rR][fF][cC]|[eE][rR][fF]_[iI][nN][vV]|[eE][rR][fF][cC]_[iI][nN][vV]|[cC][hH][aA][rR][lL][eE][nN]|[dD][bB][mM][aA][xX][lL][eE][nN]|[nN][uU][mM][oO][fF][cC][hH][aA][rR]|[sS][tT][rR][lL][eE][nN]|[cC][hH][aA][rR]_[oO][fF][fF]|[cC][mM][aA][xX]|[cC][mM][iI][nN]|[cC][oO][uU][nN][tT]|[cC][oO][uU][nN][tT]_[aA][nN][yY]_[oO][fF]|[cC][oO][uU][nN][tT]_[aA][nN][yY]_[nN][oO][tT]_[oO][fF]|[dD][iI][sS][tT][aA][nN][cC][eE]|[cC][oO][nN][dB][eE][nN][sS][eE]|[cC][oO][nN][cC][aA][tT]_[lL][iI][nN][eE][sS]_[oO][fF]|[eE][sS][cC][aA][pP][eE]|[fF][iI][nN][dB]|[fF][iI][nN][dB]_[eE][nN][dB]|[fF][iI][nN][dB]_[aA][nN][yY]_[oO][fF]|[fF][iI][nN][dB]_[aA][nN][yY]_[nN][oO][tT]_[oO][fF]|[iI][nN][sS][eE][rR][tT]|[mM][aA][tT][cC][hH]|[rR][eE][pP][eE][aA][tT]|[rR][eE][pP][lL][aA][cC][eE]|[rR][eE][vV][eE][rR][sS][eE]|[sS][eE][gG][mM][eE][nN][tT]|[sS][hH][iI][fF][tT]_[lL][eE][fF][tT]|[sS][hH][iI][fF][tT]_[rR][iI][gG][hH][tT]|[sS][uU][bB][sS][tT][rR][iI][nN][gG]|[sS][uU][bB][sS][tT][rR][iI][nN][gG]_[aA][fF][tT][eE][rR]|[sS][uU][bB][sS][tT][rR][iI][nN][gG]_[fF][rR][oO][mM]|[sS][uU][bB][sS][tT][rR][iI][nN][gG]_[bB][eE][fF][oO][rR][eE]|[sS][uU][bB][sS][tT][rR][iI][nN][gG]_[tT][oO]|[tT][oO]_[uU][pP][pP][eE][rR]|[tT][oO]_[lL][oO][wW][eE][rR]|[tT][oO]_[mM][iI][xX][eE][dB]|[fF][rR][oO][mM]_[mM][iI][xX][eE][dB]|[tT][rR][aA][nN][sS][lL][aA][tT][eE]|[xX][sS][tT][rR][lL][eE][nN]|[bB][iI][tT]-[sS][eE][tT]|[uU][tT][cC][lL][oO][nN][gG]_[cC][uU][rR][rR][eE][nN][tT]|[uU][tT][cC][lL][oO][nN][gG]_[aA][dB][dB]|[uU][tT][cC][lL][oO][nN][gG]_[dD][iI][fF][fF]|[lL][iI][nN][eE][sS]|[lL][iI][nN][eE]_[iI][nN][dB][eE][xX])$")
)

(method_spec name: (identifier) @function.method ) 
(method_implementation name: (identifier) @function.method )

; Could also be a data object but who on earth would do that..
(alias_spec alias: (identifier) @function.method )

(asynchronous_callback 
  [
    method: [
      (component_selection component: (identifier) @function.method)
      (identifier) @function.method
    ]
  routine: (identifier) @function.subroutine
  ]
)

(form_definition name: (identifier) @function.subroutine )
(subroutine_spec name: (identifier) @function.subroutine )
(subroutine_list (identifier) @function.subroutine )

; For all other variants, there is no method to be highlighted since
; it is specified via a literal string or a data object
(call_method_statement
  method: [
    (component_selection component: (identifier) @function.method )
    (identifier) @function.method
  ]
)

(constructor_spec "constructor" @constructor )
(class_constructor_spec "class_constructor" @constructor )

; VARIABLES AND PROPERTIES
; ------------------------
; Due to the nature of the typing system, we cant just mark
; each identifier as variable globally and must scope them to
; more local expressions, like declarations or operations


; This helps a great deal marking basically all identifiers as variables
; where they are interchangable with other data-like expressions.
(named_data_object/identifier) @variable

(dynamic_spec (identifier) @variable )
(dereference_expression subject: (identifier) @variable )
(substring_access (identifier) @variable )
(table_body_access (identifier) @variable )
(field_symbol name: (identifier) @variable )
(tables_declaration (identifier) @variable )

(declaration_expression (identifier) @variable )
(data_declaration 
  . (data_spec name: (identifier) @variable )
  (data_spec name: (identifier) @variable )?
)
(default_data_value (identifier) @variable )

; Similar to how typed structures work, only the outermost elements
; are actually variables while all inner specs / structs are properties.
(data_declaration 
  (end_of_struct name: (identifier) @variable ) . 
)
(data_declaration 
  . (begin_of_struct name: (identifier) @variable ) 
)

(data_declaration
  (begin_of_struct)
  [
    (data_spec name: (identifier) @variable.member)
    (begin_of_struct name: (identifier) @variable.member)
    (end_of_struct name: (identifier) @variable.member)
  ]
  (end_of_struct)
)

(class_body
  (_ ; any section
    [
      (data_declaration
        (data_spec name: (identifier) @variable.member )?
        (begin_of_struct name: (identifier) @variable.member )?
        (end_of_struct name: (identifier) @variable.member )?
      )
      (class_data_declaration
        (class_data_spec name: (identifier) @variable.member )?
        (begin_of_struct name: (identifier) @variable.member )?
        (end_of_struct name: (identifier) @variable.member )?
      )
    ]
  )
)


[ 
  (itab_comp_spec)
] comp: (identifier) @variable.member 


; The component of a struct access is always a variable.member even in a type context.
(component_selection
  selector: ["-" "=>"]
  component: (identifier) @variable.member
)

(component_selection
  subject: (identifier)? @variable
  selector: "->"
  component: (identifier) @variable.member
)

; TODO: This incorrectly tags in a typing context as well, are there
; some mental gymnastics we can do to prevent that? 
(component_selection
  subject: (identifier) @variable
  selector: "-"
)

(key_components (identifier) @variable.member )
(mapping (identifier) @variable.member )
(lookup_mapping (identifier) @variable.member )
(except_list (identifier) @variable.member )

; Parameter identifiers
(named_argument name: (identifier) @variable.parameter )

(implicit_reference name: (identifier) @variable.parameter )
(explicit_value name: (identifier) @variable.parameter )
(explicit_reference name: (identifier) @variable.parameter )
(preferred_parameter name: (identifier) @variable.parameter )

(table_key name: (identifier) @variable.key )
(using_key name: (identifier) @variable.key )

(exceptions (identifier) @variable.parameter )
(raising_exception exception: (identifier) @variable.parameter )
(raise_statement name: (identifier) @variable.parameter )

(at_selscreen_statement
  event: [
    (on_help_request (identifier) @variable.parameter )
    (on_parameter (identifier) @variable.parameter )
    (on_value_request (identifier) @variable.parameter )
    (on_end_of_parameter (identifier) @variable.parameter )
    (on_radiobutton_group (identifier) @constant )
    (on_block (identifier) @constant )
  ]
)

(parameters_spec name: (identifier) @variable.parameter )
(include_parameter_directive name: (identifier) @variable.parameter )
(select_options_spec name: (identifier) @variable.parameter )
(include_select_option_directive name: (identifier) @variable.parameter )
(pushbutton_element name: (identifier) @variable )
(include_pushbutton_directive name: (identifier) @variable )
(user_command_spec (identifier) @constant )
(memory_id_spec (identifier) @constant )
(modif_id_spec (identifier) @constant )
(radiobutton_group (identifier) @constant )
(default_value_spec (identifier) @constant )
(search_help_spec (identifier) @type )

; Regular block is technically a constant, but its difficult
; to disambiguate from an end of tabbed block
(begin_of_block_element (identifier) @variable )
(include_block_directive (identifier) @variable )
(tab_spec name: (identifier) @variable )
(begin_of_tabbed_block_element (identifier) @variable )
(end_of_block_element (identifier) @variable )

(comment_spec 
  [
    name: (identifier) @variable
    (for_screen_field name: (identifier) @variable.parameter )
  ]
) 
(output_position
  position: (identifier) @constant.builtin
)

(message_spec 
  type: (message_type)? @constant.builtin 
  id: (identifier)? @variable 
)

; CONSTANTS
((identifier) @constant.builtin
  (#match? @constant.builtin "^([aA][bB][aA][pP]_(([tT][rR][uU][eE])|([fF][aA][lL][sS][eE])|([uU][nN][dD][eE][fF][iI][nN][eE][dD])))$" )
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
  (end_of_struct name: (identifier) @constant ) . 
)
(constants_declaration 
  . (begin_of_struct name: (identifier) @constant ) 
)

(constants_declaration
  (begin_of_struct)
  [
    (constants_spec name: (identifier) @variable.member)
    (begin_of_struct name: (identifier) @variable.member)
    (end_of_struct name: (identifier) @variable.member)
  ]
  (end_of_struct)
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

(non_resumable_exception name: (identifier) @type )
(resumable_exception name: (identifier) @type )
(new_exception_spec class_name: (identifier) @type )
(catch_exception_list (identifier) @type )

(interfaces_spec 
  [
    name: (identifier) @type 
    (abstract_methods 
      [
        (identifier) @function.method
        (component_selection
          selector: "~"
          component: (identifier) @function.method
        )
      ]
    )
    (final_methods 
      [
        (identifier) @function.method
        (component_selection
          selector: "~"
          component: (identifier) @function.method
        )
      ]
    )
    (data_values 
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

(for_event
  [
	source: (identifier) @type
    name: (identifier) @variable.event
  ]
)


(function_call
  source: [
      (identifier) @type 
      (component_selection
        component: (identifier) @type
      )
  ] 
  "~"
)
; WARN: We need some way to ensure that this doesnt tag variables in
; 'like' expressions, so the grammar must map those as 'object'
(_ typing: (_ object: (identifier) @variable ))
(_ typing: (_ (identifier) @type !object ))
(_ typing: (_ (identifier) @type.builtin !object 
  (#match? @type.builtin "^([bBcCdDfFiInNpPsStTxX]|[dD][eE][cC][fF][lL][oO][aA][tT]16|[dD][eE][cC][fF][lL][oO][aA][tT]34|[iI][nN][tT]8|[sS][tT][rR][iI][nN][gG]|[uU][tT][cC][lL][oO][nN][gG]|[xX][sS][tT][rR][iI][nN][gG]|[aA][nN][yY])$")
))


; Must be more specific than the variable rule so it takes precedence. 
; No choice but to support up to a certain depth (3)
(_ typing: (_ 
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

; Only applies to immediate decls due to anchor tag (not structs)
; TODO: This will wrongly tag long-form struct properties, can that be avoided?
(types_declaration
  . (types_spec name: (identifier) @type ) )


; NOTE: Do not try to integrate the below anchor tags. While that
; works in the playground and neovim, the CLI highlighter seems
; to have some issue with it making it fail the tests.
(types_declaration
  (begin_of_struct)
  [
    (types_spec name: (identifier) @variable.member)
    (begin_of_struct name: (identifier) @variable.member)
    (end_of_struct name: (identifier) @variable.member)
  ]
  (end_of_struct)
)

; Only the top-level declaration is considered a type.
; Split by design to support both chained and explicit decls.
(types_declaration
  . (begin_of_struct name: (identifier) @type )
)
(types_declaration
  (end_of_struct name: (identifier) @type) .
)

; In this context, table kind keywords specify a generic type.
(typing/table_type
  kind: (_ keyword: _ @type.builtin ) .
)

; TODO: Gave up on explicit, long form declarations for now.
; The sibling relationship doesnt work well with incremental parsing


(include_statement
  name: (identifier) @module
)

(report_statement
  name: (identifier) @module
  (default_message_class name: (identifier) @type )?
  (defining_database name: (identifier) @type )?
)



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
    "&&="
] @operator


[     
  "eq"
  "ne"
  "and"
  "or"
  "equiv"
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
] @keyword.operator

[
	  "return"
	  "exit"
] @keyword.return

[
    "continue"
    "endat"
] @keyword.repeat

[
    "check"
] @keyword.conditional

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
(resumable_exception "resumable" @keyword.modifier )

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
(resumable_spec "resumable" @keyword.exception )
(try_statement ["try" "endtry" ] @keyword.exception )
(catch_clause ["catch" ] @keyword.exception )
(before_unwind_spec ["before" "unwind" ] @keyword.exception )
(cleanup_clause "cleanup" @keyword.exception )

(if_statement [ "if" "endif" ] @keyword.conditional )
(elseif_clause "elseif" @keyword.conditional)
(else_clause "else" @keyword.conditional)

(case_statement ["case" "endcase"] @keyword.conditional )
(case_clause "when" @keyword.conditional)
(others_case_clause [ "when" "others" ] @keyword.conditional )

(case_type_of_statement ["case" "type" "of" "endcase" ] @keyword.conditional )
(case_type_clause [ "when" "type" ] @keyword.conditional )
(case_others_type_clause [ "when" "others" ] @keyword.conditional )

(do_statement ["do" "times" "enddo"  ] @keyword.repeat )
(while_statement ["while" "endwhile" ] @keyword.repeat )

(loop_at_statement ["loop" "at" "endloop" ] @keyword.repeat )
(at_first_statement ["at" "first"] @keyword.repeat )
(at_last_statement ["at" "last"] @keyword.repeat )
(at_new_statement ["at" "new"] @keyword.repeat )
(at_end_of_statement ["at" "end" "of"] @keyword.repeat )


; Keywords that can be considered control flow without context check
; As of now, new keywords should be added to the uncontextualized
; array and only moved to a context if needed.

(format_option parameter: (identifier) @keyword )
