line_exists( itab[ 1 ] )
"<- function.call
"            ^ variable
condense( val = `...` )
"<- function.call
"         ^ variable.parameter
"               ^ string
condense( val = `...` del = ` ` )
"<- function.call
"         ^ variable.parameter
"               ^ string
"                     ^ variable.parameter
"                           ^ string
ceil( floor( nmin( val1 = var1 val2 = var2 ) ) ).
"<- function.call
"     ^ function.call
"            ^ function.call
"                  ^ variable.parameter
"                         ^ variable
"                              ^ variable.parameter
"                                     ^ variable
my_custom_function( foo = bar )
"<- function.method.call
"                   ^ variable.parameter
"                         ^ variable
msg->if_message~get_text( )
" <- variable
"  ^ operator
"    ^ type
"              ^ operator
"               ^ function.method.call
reported-obj-%msg->if_message~get_text( )
" <- variable
"       ^ operator
"        ^ variable.member
"           ^ operator
"            ^ variable.member
"                ^ operator
"                  ^ type
"                            ^ operator
"                             ^ function.method.call
