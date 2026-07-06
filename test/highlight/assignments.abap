oref2 = CAST type( oref1 ). 
"<- variable
"       ^ keyword
"            ^ type
"                  ^ variable
struc-col1 = CAST t_struc( dref )->col1. 
"<- variable
"     ^ variable.member
"            ^ keyword
"                 ^ type
"                          ^ variable
"                                  ^ variable.member
source = CONV string( text )
"<- variable
"        ^ keyword
"             ^ type.builtin
"                     ^ variable
int = CONV i( sqrt( 5 ) ) + CONV i( sqrt( 6 ) ).
"          ^ type.builtin
"             ^ function.builtin
"                                ^ type.builtin
"                                   ^ function.builtin
p2 = EXACT result( p1 )
"<- variable
"     ^ keyword
"          ^ type
"                  ^ variable
res = EXACT #( foo * ( baz / baz ) ). 
"<- variable
"              ^ variable
"                      ^ variable
"                            ^ variable
