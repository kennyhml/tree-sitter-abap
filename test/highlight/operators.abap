my_string+10
" ^ variable
"        ^ operator
"         ^ number
my_string(10)
" ^ variable
"         ^ number
my_string(foo)
" ^ variable
"         ^ variable
my_string+off(len)
" ^ variable
"         ^ variable
"             ^ variable
ref->*+10(length)
" ^ variable
"  ^ operator
"    ^ operator
"      ^ number
"         ^ variable
<fs>+offset(10)
" ^ variable
"   ^ operator
"    ^ variable
"           ^ number
range_tab_with_header_line[]
"                         ^ operator
" ^ variable
zclass=>component.
" <- class
"     ^ operator
"       ^ variable.property
myobj->component.
" <- variable
"    ^ operator
"      ^ variable.property
struct-component
" <- variable
"     ^ operator
"      ^ variable.property
struct-component->attribute
" <- variable
"     ^ operator
"      ^ variable.property
"               ^ operator
"                 ^ variable.property
class=>struct-component->attribute
" <- class
"    ^ operator
"      ^ variable.property
"            ^ operator
"             ^ variable.property
"                      ^ operator
"                        ^ variable.property
if_message~text
" <- interface
"         ^ operator
"          ^ variable.property
msg->if_message~text
" <- variable
"   ^ operator
"              ^ operator
"    ^ variable.property
"               ^ variable.property
msg->if_message~get_text( )
" <- variable
"  ^ operator
"    ^ variable.property
"              ^ operator
"               ^ function.method
reported-obj-%msg->if_message~get_text( )
" <- variable
"       ^ operator
"        ^ variable.property
"           ^ operator
"            ^ variable.property
"                ^ operator
"                  ^ variable.property
"                            ^ operator
"                             ^ function.method
foo-('bar')-baz
" <- variable
"  ^ operator
"     ^ string
"          ^ operator
"           ^ variable.property
cl_class=>('bar')-baz
" <- class
"       ^ operator
"           ^ string
"                ^ operator
"                 ^ variable.property
itab-(1)->baz
" <- variable
"   ^ operator
"     ^ number
"       ^ operator
"         ^ variable.property
itab-(num)->baz
" <- variable
"   ^ operator
"     ^ variable
"         ^ operator
"           ^ variable.property
(classname)=>attribute
"^ variable
"          ^ operator
"            ^ variable.property
(classname)=>(attrname)
"^ variable
"          ^ operator
"             ^ variable
(classname)=>foo( )
"^ variable
"          ^ operator
"            ^ function.method
(classname)=>foo( )
"^ variable
"          ^ operator
"            ^ function.method
deep_tab[ 2 ]-compb[ 1 ][ 2 ]-comp2
"<- variable
"       ^ operator
"            ^ operator
"             ^ variable.property
"                  ^ operator
"                       ^ operator
"                            ^ operator
"                             ^ variable.property
