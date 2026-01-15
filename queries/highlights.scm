(literal_string) @string
(number) @number
(type_identifier) @type
(builtin_type_spec) @type.builtin

(class_component_selector class: (identifier) @class )

(static_component (identifier) @variable.property )
(itab_comp_spec (identifier) @variable.property )

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
] @operator

[
	":"
    "."
    ","
    "("
    ")"
    "["
    "]"
    "#"
] @delimiter

[   
    "data"
    "final"
    "type"
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
    
    "table"
    "of"
    "size"
    "standard"
    "sorted"
    "hashed"
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
    "types"
    "mod"
    "div"
    "new"
    
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

] @keyword

(identifier) @variable