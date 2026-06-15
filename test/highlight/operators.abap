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
msg~if_message->text
" <- variable
"  ^ operator
"    ^ interface
"             ^ operator
"               ^ variable.property
msg~if_message->get_text( )
