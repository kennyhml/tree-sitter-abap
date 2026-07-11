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
"             ^ function.call
"                                ^ type.builtin
"                                   ^ function.call
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
dref = REF res( pict )
"<- variable
"      ^ keyword
"          ^ type
"               ^ variable
dref = REF string( foo+off(len) )
"<- variable
"      ^ keyword
"          ^ type.builtin
"                  ^ variable
"                      ^ variable
"                          ^ variable
dref = REF string( let foo = get_handler( ) in foo )
"                      ^ variable
"                            ^ function.method.call
ASSIGN datlo TO <year>. 
"<- keyword
"      ^ variable
"                ^ variable
ASSIGN sy-timlo TO <fs> CASTING TYPE time.
"      ^ variable.builtin
"         ^ variable.member
"                                    ^ type
ASSIGN time TO <fs> CASTING LIKE sy-timlo. 
"                                ^ variable.builtin
"                                   ^ variable.member
ASSIGN datlo TO <fs> CASTING TYPE HANDLE struct. 
"                                        ^ variable
ASSIGN COMPONENT i OF STRUCTURE para TO FIELD-SYMBOL(<comp>). 
"                ^ variable
"                               ^ variable
ASSIGN struct-col1 INCREMENT inc TO <fs> RANGE struct. 
"                            ^ variable
"                                              ^ variable
UNASSIGN <fs>.
"<- keyword
"         ^ variable
