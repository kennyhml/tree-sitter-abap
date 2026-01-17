(literal_string) @string
(string_template) @string

(number) @number
(type_identifier) @type
(builtin_type_spec) @type.builtin

(class_component_selector class: (identifier) @class )

(static_component (identifier) @variable.property )
(itab_comp_spec (identifier) @variable.property )

(parameter name: (identifier) @variable.parameter )
(preferred_parameter name: (identifier) @variable.parameter )

(builtin_function_call (identifier) @function.builtin )
(method_spec name: (identifier) @function.method ) 
(method_call name: (identifier) @function.method )
(constructor_spec
  [
    "constructor"
    "class_constructor"
  ] @function.constructor
)
 
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
] @operator

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
    
    "table"
    "of"
    "size"
    "standard"
    "sorted"
    "hashed"
    "unique"
    "index"
    "any"

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
    
    "methods"
    "class-methods"
    "importing"
    "exporting"
    "changing"
    "returning"
    "receiving"
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
    
  
] @keyword

(identifier) @variable