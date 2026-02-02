(literal_string) @string
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

(exception name: (identifier) @class )
(raise_exception_statement name: (identifier) @class )
(catch_exception_list (identifier) @class )

(class_options
	parent: (identifier) @class
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

(constructor_spec
  [
    "constructor"
    "class_constructor"
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
(parameter name: (identifier) @variable.parameter )
(preferred_parameter name: (identifier) @variable.parameter )

(table_key_spec name: (identifier) @variable.key )

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

(if_statement [ "if" "endif" ] @keyword.control )
(elseif_clause "elseif" @keyword.control)
(else_clause "else" @keyword.control)

(case_statement ["case" "endcase"] @keyword.control )
(case_clause [ "when" "others" ] @keyword.control)

(type_case_statement ["case" "type" "of" "endcase" ] @keyword.control )
(type_case_clause [ "when" "type" "others" ] @keyword.control)

(do_statement ["do" "times" "enddo"  ] @keyword.control )
(while_statement ["while" "endwhile" ] @keyword.control )
(try_statement ["try" "endtry" ] @keyword.control )
(catch_clause ["catch" "before" "unwind" ] @keyword.control )
(cleanup_clause "cleanup" @keyword.control )

(raise_exception_statement ["raise" "exception" ] @keyword.control )

; Keywords that can be considered control flow without context check
; As of now, new keywords should be added to the uncontextualized
; array and only moved to a context if needed.
[
	"return"
	"exit"
    "check"
    "continue"
    "resume"
] @keyword.control

; ------------------------------------------
; Keywords
; ------------------------------------------
[   
    "data"
    "final"
    "constants"
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




; Other identifiers not yet specified
(identifier) @variable