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
(deferred_class_definition name: (identifier) @class )
(class_definition name: (identifier) @class )
(class_implementation name: (identifier) @class )

(simple_exception_spec name: (identifier) @class )
(resumable_exception_spec name: (identifier) @class )
(new_exception_spec class_name: (identifier) @class )
(catch_exception_list (identifier) @class )

(component_expression
  subject: (identifier) @class
  operator: "=>"
)

(superclass_spec name: (identifier) @class)
(for_event_spec 
  [
	source: (identifier) @class
    name: (identifier) @variable.event
  ]
)

(ref_to 
  subject: (identifier) @class 
  (#match? @class "^(([zZyYlL]|/[a-zA-Z][a-zA-Z][a-zA-Z]/)?[cC][lL]_)")
)

; ------------------------------------------
; Interface identifiers, ambiguity exists.
; ------------------------------------------
(deferred_interface_definition name: (identifier) @interface )
(interfaces_declaration (identifier) @interface )
(interface_definition name: (identifier) @interface )

; NOTE: Complement semantics using prefixes: 
; Z and Y ($TMP) 
; L (local scope)
; /xxx/ (Parter / Customer namespace)
; If no prefix match, it is simply considered a type.
; To be seen as a best effort that only works with naming conventions.
(ref_to 
  subject: (identifier) @interface
  (#match? @interface "^(([zZyYlL]|/[a-zA-Z][a-zA-Z][a-zA-Z]/)?[iI][fF]_)")
)

(component_expression 
    subject: [
      (identifier) @interface 
      (component_expression
        component: (identifier) @interface
      )
    ]
    operator: "~"
    component: (identifier) @property
)

(function_call
  source: [
      (identifier) @interface 
      (component_expression
        component: (identifier) @interface
      )
  ] 
  "~"
)

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
      (component_expression component: (identifier) @function.method)
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
    (component_expression component: (identifier) @function.method )
    (identifier) @function.method
  ]
)

(constructor_spec
  [
    "constructor"
    "class_constructor"
  ] @function.constructor
)

; VARIABLES AND PROPERTIES
; ------------------------
; Due to the nature of the typing system, we cant just mark
; each identifier as variable globally and must scope them to
; more local expressions, like declarations or operations


; This helps a great deal marking basically all identifiers as variables
; where they are interchangable with other data-like expressions.
(named_data_object/identifier) @variable

(dynamic_expression (identifier) @variable )
(dereference_expression subject: (identifier) @variable )
(substring_access (identifier) @variable )
(table_body_access (identifier) @variable )
(field_symbol name: (identifier) @variable )

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
    (data_spec name: (identifier) @property)
    (begin_of_struct name: (identifier) @property)
    (end_of_struct name: (identifier) @property)
  ]
  (end_of_struct)
)


[ 
  (itab_comp_spec)
] comp: (identifier) @property 


; The component of a struct access is always a property even in a type context.
(component_expression
  operator: ["-" "=>"]
  component: (identifier) @property
)

(component_expression
  subject: (identifier)? @variable
  operator: "->"
  component: (identifier) @property
)

; TODO: This incorrectly tags in a typing context as well, are there
; some mental gymnastics we can do to prevent that? 
(component_expression
  subject: (identifier) @variable
  operator: "-"
)

(key_components (identifier) @property )
(mapping (identifier) @property )
(lookup_mapping (identifier) @property )
(except_list (identifier) @property )

; Parameter identifiers
(named_argument name: (identifier) @variable.parameter )

([
  (value_param_spec)
  (simple_param_spec)
  (reference_param_spec)
  (preferred_param_spec)
] name: (identifier) @variable.parameter )

(table_key name: (identifier) @variable.key )
(using_key name: (identifier) @variable.key )

(exception_list (identifier) @variable.parameter )
(raising_exception exception: (identifier) @variable.parameter )
(raise_statement name: (identifier) @variable.parameter )

(message_spec 
  type: (message_type)? @constant.builtin 
  id: (identifier)? @variable 
  )



; CONSTANTS
((identifier) @constant.builtin
  (#match? @constant.builtin "^([aA][bB][aA][pP]_(([tT][rR][uU][eE])|([fF][aA][lL][sS][eE])|([uU][nN][dD][eE][fF][iI][nN][eE][dD])))$" )
)
(constants_spec name: (identifier) @constant )

; General type identifiers (if not specified elsewhere)
; WARN: We need some way to ensure that this doesnt tag variables in
; 'like' expressions, so the grammar must map those as 'object'
(types_spec typing: (_ (identifier) @type !object ))
(types_spec typing: (_ object: (identifier) @variable ))

; TODO: This is not fully fleshed out yet - builtin types are referred to
; as referred types in other typing constructs as of now.
(abap_type name: (identifier) @type.builtin )

; Must be more specific than the variable rule so it takes precedence. 
; No choice but to support up to a certain depth (3)
(types_spec typing: (_ 
  (component_expression 
    subject: [
      (identifier) @type
      (component_expression
        subject: [
          (identifier) @type
          (component_expression
              subject: (identifier) @type
              operator: "-"
          )
        ]
        operator: "-"
      )
    ]
    operator: "-"
)))

; To tag the component, not the subject. Either the subject is another
; chained expression, in which case we descend, or its an identifier
; in which case the immediate component is the type
(types_spec typing: (_
    [
     (component_expression 
       subject: [
         (component_expression 
           subject:
             (component_expression
               subject: (identifier) @class
               operator: "=>"
               component: (identifier) @type )
         )
         (component_expression
           subject: (identifier) @class
           operator: "=>"
           component: (identifier) @type )
        ]
      )
     (component_expression
       subject: (identifier) @class
       operator: "=>"
       component: (identifier) @type )
    ]
))

; Make sure not to overlap with what was previously matched as class / interface
(ref_to 
  subject: (identifier) @type
  (#not-match? @type "^(([zZyYlL]|/[a-zA-Z][a-zA-Z][a-zA-Z]/)?([cC][lL]|[iI][fF])_)")
)
(ref_to object: (identifier) @variable )
(referred_type name: (identifier) @type )

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
    (types_spec name: (identifier) @property)
    (begin_of_struct name: (identifier) @property)
    (end_of_struct name: (identifier) @property)
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

; TODO: Gave up on explicit, long form declarations for now.
; The sibling relationship doesnt work well with incremental parsing


; ------------------------------------------
; ABAP Doc tags, links, etc.
; ------------------------------------------
(doctag
  (tag) @abapdoc.tag
  (#match? @abapdoc.tag "@parameter")
  value: (identifier) @variable.parameter)

(doctag
  (tag) @abapdoc.tag
  (#eq? @abapdoc.tag "@raising")
  value: (identifier) @class)

(doctag
  (tag) @abapdoc.tag
  (#eq? @abapdoc.tag "@exception")
  value: (identifier) @variable.parameter)

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
    "["
    "]"
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
    "{"
    "}"
] @delimiter


; ------------------------------------------
; Control Flow keywords
; ------------------------------------------
; For alot of keywords, the context matters. E.g "FOR" 
; is a control keyword in a for loop, but not in
; the combination of regular keywords "FOR TESTING"

(if_statement [ "if" "endif" ] @keyword.control )
(elseif_clause "elseif" @keyword.control)
(else_clause "else" @keyword.control)

(case_statement ["case" "endcase"] @keyword.control )
(case_clause "when" @keyword.control)
(others_case_clause [ "when" "others" ] @keyword.control)

(case_type_of_statement ["case" "type" "of" "endcase" ] @keyword.control )
(case_type_clause [ "when" "type" ] @keyword.control)
(case_others_type_clause [ "when" "others" ] @keyword.control)

(do_statement ["do" "times" "enddo"  ] @keyword.control )
(while_statement ["while" "endwhile" ] @keyword.control )
(try_statement ["try" "endtry" ] @keyword.control )
(catch_clause ["catch" "before" "unwind" ] @keyword.control )
(cleanup_clause "cleanup" @keyword.control )

(loop_at_statement ["loop" "at" "endloop" ] @keyword.control )
(at_first_statement ["at" "first"] @keyword.control )
(at_last_statement ["at" "last"] @keyword.control )
(at_new_statement ["at" "new"] @keyword.control )
(at_end_of_statement ["at" "end" "of"] @keyword.control )

(raise_exception_statement ["raise" "exception" ] @keyword.control )
(resumable_spec "resumable" @keyword.control )

; Keywords that can be considered control flow without context check
; As of now, new keywords should be added to the uncontextualized
; array and only moved to a context if needed.
[
	"return"
	"exit"
    "check"
    "continue"
    "resume"
    "endat"
] @keyword.control

; ------------------------------------------
; Keywords
; ------------------------------------------
[   
    "data"
    "final"
    "constants"
    "field-symbols"
    "type"
    "types"
    "aliases"
    "class-data"
    "ref"
    "to"
    "like"
    "value"
    "length"
    "decimals"
    "is"
    "initial"
    "read-only"
    "begin"
    "end"
    "of"
    "lines"
    "let"
    "in"
    "until"
    
    "table"
    "of"
    "size"
    "standard"
    "sorted"
    "hashed"
    "unique"
    "non-unique"
    "index"
    "any"
    "occurs"
    "header"
    "line"
    "empty"


    "report"
    "no"
    "page"
    "heading"
    "line-size"
    "line-count"
    "defining"
    "database"
    "reduced"
    "functionality"
    "message-id"
    "range"
    "mod"
    "div"
    "new"
    "switch"

    "replace"
    "with"
    "verbatim"
    "replacement"
    
    "concatenate"
    "into"
    "separated"
    "by"
    
    "respecting"
    "ignoring"
    "case"
    "blanks"
    
    "find"
    "first"
    "occurrence"
    "all"
    "occurrences"
    "in"
    "section"
    "offset"
    
    "byte"
    "character"
    "mode"
    
    "pcre"
    "match"
    "count"
    "results"
    "submatches"
    
    "shift"
    "places"
    "up"
    "left"
    "right"
    "circular"
    
    "deleting"
    "leading"
    "trailing"
    
    "split"
    "at"
    "condense"
    "no-gaps"
    
    "base"
    "key"
    "components"
    
    "index"
    
    "class"
    "definition"
    "create"
    "public"
    "protected"
    "private"
    "inheriting"
    "from"
    "abstract"
    "global"
    "local"
    "friends"
    "shared"
    "memory"
    "enabled"
    "for"
    "behavior"
    "testing"
    "risk"
    "level"
    "harmless"
    "medium"
    "critical"
    "duration"
    "short"
    "long"
    "implementation"
    "deferred"
    "endclass"
    
    "interface"
    "interfaces"
    "endinterface"
    
    "methods"
    "method"
    "endmethod"
    "class-methods"
    "importing"
    "exporting"
    "changing"
    "returning"
    "receiving"
    "reference"
    "raising"
    "exceptions"
    "default"
    "optional"
    "preferred"
    "parameter"
    "resumable"
    "redefinition"
    "fail"
    "ignore"
    "event"
    
    "cond"
    "when"
    "then"
    "else"
    "conv"
    "exact"
    "cast"
	"step"
    
    "corresponding"
    "appending"
    "deep"
    "discarding"
    "duplicates"
    "mapping"
    "except"
    "using"
    "throw"
    
    "filter"
    "where"
    "reduce"
    "init"
    "next"
    "while"
    
    "and"
    "or"
    "equiv"
    
    "if"
    "elseif"
    "endif"
    
    "case"
    "others"
    "endcase"
    
    "raise"
    "exception"
    "return"
    
    "do"
    "times"
    "enddo"
    "endwhile"
    
    "message"
    "id"
    "number"
    "display"
    
    "try"
    "catch"
    "before"
    "unwind"
    "endtry"
    "cleanup"
    
    "exit"
    "check"
    "continue"
    "resume"
    
    "call"
    "function"
    "tables"
    "remote"
    "session"
    "destination"
    "starting"
    "new"
    "task"
    "group"
    "parameter-table"
    "exception-table"
    "performing"
    "calling"
    "on"
    "background"
    "update"
    "task"
    "as"
    "separate"
    "unit"
    "alias"
    
    "form"
    "endform"
    "structure"
    "perform"
    "program"
    "found"
    "rollback"
    "commit"
    
    "loop"
    "assigning"
    "field-symbol"
    "endloop"
    "transporting"
    "fields"
    "without"
    "members"
    "ascending"
    "descending"
    "text"
    
    "set"
    "commit"
    "work"
    "wait"
    "include"
    "clear"
    "free"
    "sort"
    "stable"
    
    ; Dynpro
    "parameters"
    "select-options"
    "modif"
    "obligatory"
    "as"
    "checkbox"
    "radiobutton"
    "listbox"
    "visible"
    "user-command"
    "matchcode" 
    "object"
    "no-display"
    "lower"
    "intervals"
    "no-extension"
    "off"
    "option"
    "sign"
    "i"
    "e"
    
    "selection-screen"
    "skip"
    "block"
    "uline"
    "screen"
    "subscreen"
    "nesting" 
    "level"
    "title"
    "window"
    "frame"
    "comment"
    "field"
    "pushbutton"
    "position"
    "tabbed"
    "tab"
    "blocks"
    "ending"
    "selection-set"
    "delete"
    "adjacent"
    "comparing"
    "read"
    "binary"
    "search"
    "unassign"
    "append"
    "insert"
    
    ; Should these be considered control keywords??
    "output"
    "exit-command"
    "help-request"
    "value-request"
    "start-of-selection"
    "initialization"
    "load-of-program"
    
    ; predicates
    "not"
    "bound"
    "instance"
    "assigned"
    "supplied"

    ; comparison operators
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
    "bt"
    "nb"
    "byte-co"
    "byte-cn"
    "byte-ca"
    "byte-na"
    "byte-cs"
    "byte-ns"
    "o"
    "z"
    "m"
] @keyword
(format_option parameter: (identifier) @keyword )
