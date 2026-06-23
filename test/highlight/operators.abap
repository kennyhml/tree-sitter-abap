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
zclass=>component.
" <- type
"     ^ operator
"       ^ variable.member
myobj->component.
" <- variable
"    ^ operator
"      ^ variable.member
struct-component
" <- variable
"     ^ operator
"      ^ variable.member
struct-component->attribute
" <- variable
"     ^ operator
"      ^ variable.member
"               ^ operator
"                 ^ variable.member
class=>struct-component->attribute
" <- type
"    ^ operator
"      ^ variable.member
"            ^ operator
"             ^ variable.member
"                      ^ operator
"                        ^ variable.member
if_message~text
" <- type
"         ^ operator
"          ^ variable.member
msg->if_message~text
" <- variable
"   ^ operator
"    ^ type
"              ^ operator
"               ^ variable.member
msg->if_message~get_text( )
" <- variable
"  ^ operator
"    ^ type
"              ^ operator
"               ^ function.method
reported-obj-%msg->if_message~get_text( )
" <- variable
"       ^ operator
"        ^ variable.member
"           ^ operator
"            ^ variable.member
"                ^ operator
"                  ^ type
"                            ^ operator
"                             ^ function.method
foo-('bar')-baz
" <- variable
"  ^ operator
"     ^ string
"          ^ operator
"           ^ variable.member
cl_class=>('bar')-baz
" <- type
"       ^ operator
"           ^ string
"                ^ operator
"                 ^ variable.member
itab-(1)->baz
" <- variable
"   ^ operator
"     ^ number
"       ^ operator
"         ^ variable.member
itab-(num)->baz
" <- variable
"   ^ operator
"     ^ variable
"         ^ operator
"           ^ variable.member
(classname)=>attribute
"^ variable
"          ^ operator
"            ^ variable.member
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
"            ^ operator
"             ^ variable.member
"                            ^ operator
"                             ^ variable.member
