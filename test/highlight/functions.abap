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
lo_object->meth1( 
    EXPORTING
        foo = bar
"       ^ variable.parameter
        baz = abap_true
"       ^ variable.parameter
    IMPORTING
        foo = final(foo)
"       ^ variable.parameter
    RECEIVING
        foobar = foobar
"       ^ variable.parameter
    CHANGING
        sum = result_sum
"       ^ variable.parameter
        total = result_total
"       ^ variable.parameter
    EXCEPTIONS
        not_found = 1
"       ^ variable.parameter
        foo = 2
"       ^ variable.parameter
        bar = 3
"       ^ variable.parameter
        others = 10
"       ^ variable.parameter.builtin
    ).
