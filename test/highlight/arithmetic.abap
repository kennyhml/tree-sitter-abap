10 + foo
"<- number
"  ^ operator
"    ^ variable
foo mod bar
"<- variable
"   ^ operator
"       ^ variable
foo div +bar
"   ^ operator
"       ^ operator
"        ^ variable
baz ** -foo
"   ^ operator
"      ^ operator
"       ^ variable
( 10 * 20 ) / 20
"<- punctuation.bracket
"    ^ operator
"         ^ punctuation.bracket
"           ^ operator
( exp( x ) - exp( -1 * x ) ) / 2
" ^ function.builtin
"          ^ operator
"             ^ function.builtin
"                 ^ number
"                    ^ operator
"                      ^ variable
"                            ^ operator
