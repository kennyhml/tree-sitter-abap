VALUE i( )
"<- keyword
"     ^ type.builtin
VALUE #( )
"     ^ operator
VALUE string( let var = 'A String' in 'Using let expression ' && var )
"     ^ type.builtin
"                 ^ variable
VALUE t_struct( col1 = 1 col2 = col2 col3-field1 = foo ). 
"     ^ type
"               ^ variable.member
"                        ^ variable.member
"                                    ^ variable.member
"                                         ^ variable.member
VALUE struct( BASE base2 col2 = 'BB' ). 
"                  ^ variable

VALUE #( ( col1 = 1 col2 = 2 ) ( col1 = 3 foo-bar-col2 = 4 ) ).
"          ^ variable.member
"                   ^ variable.member
"                                ^ variable.member
"                                         ^ variable.member
VALUE #( sign = 'I' option = 'LT' ( low = 41 ) option = 'GE' ( low = 61 )  ).
"        ^ variable.member
"                   ^ variable.member
"                                   ^ variable.member
"                                              ^ variable.member
"                                                              ^ variable.member
VALUE t_itab( ( ) ( 1 ) ( 2 ) ( LINES OF jtab ) )
"                                        ^ variable

VALUE t_itab( ( LINES OF jtab FROM start to END STEP 3 using key primary_key ) )
"                                  ^ variable
"                                           ^ variable
"                                                                ^ variable.key
