line_exists( itab[ 1 ] )
"<- function.builtin
"            ^ variable
condense( val = `...` )
"<- function.builtin
"         ^ variable.parameter
"               ^ string
condense( val = `...` del = ` ` )
"<- function.builtin
"         ^ variable.parameter
"               ^ string
"                     ^ variable.parameter
"                           ^ string
ceil( floor( nmin( val1 = var1 val2 = var2 ) ) ).
"<- function.builtin
"     ^ function.builtin
"            ^ function.builtin
"                  ^ variable.parameter
"                         ^ variable
"                              ^ variable.parameter
"                                     ^ variable
my_custom_function( foo = bar )
"<- function.method
"                   ^ variable.parameter
"                         ^ variable
