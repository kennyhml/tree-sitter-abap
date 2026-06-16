zclass=>component.
" <- class
"       ^ variable.property
myobj->component.
" <- variable
"      ^ variable.property
struct-component
" <- variable
"      ^ variable.property
struct-component->attribute
" <- variable
"      ^ variable.property
"                 ^ variable.property
class=>struct-component->attribute
" <- class
"      ^ variable.property
"             ^ variable.property
"                        ^ variable.property
if_message~text
" <- interface
"          ^ variable.property
msg->if_message~text
" <- variable
"    ^ variable.property
"               ^ variable.property
msg->if_message~get_text( )
" <- variable
"    ^ variable.property
"               ^ function.method
reported-obj-%msg->if_message~get_text( )
" <- variable
"        ^ variable.property
"            ^ variable.property
"                  ^ variable.property
"                             ^ function.method
foo-('bar')-baz
" <- variable
"     ^ string
"           ^ variable.property
cl_class=>('bar')-baz
" <- class
"           ^ string
"                 ^ variable.property
itab-(1)->baz
" <- variable
"     ^ number
"         ^ variable.property
itab-(num)->baz
" <- variable
"     ^ variable
"           ^ variable.property
(classname)=>attribute
"^ variable
"            ^ variable.property
(classname)=>(attrname)
"^ variable
"             ^ variable
(classname)=>foo( )
"^ variable
"            ^ function.method
(classname)=>foo( )
"^ variable
"            ^ function.method
deep_tab[ 2 ]-compb[ 1 ][ 2 ]-comp2
