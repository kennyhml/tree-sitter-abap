SWITCH string( foo WHEN 1 THEN bar WHEN 2 THEN baz ELSE '' ).
"      ^ type.builtin
"              ^ variable      
"                              ^ variable      
"                                              ^ variable      
SWITCH string( a WHEN 1 THEN 'one' ELSE THROW cx_overflow( ) )
"                                             ^ type      
COND #( LET t = '120000' IN WHEN time < t THEN foo 
"           ^ variable      
"                                              ^ variable      
                            WHEN time > t AND time < '240000' THEN bar
"                                                                  ^ variable      
                            ELSE baz )
"                                ^ variable      
COND i( WHEN cflag = abap_true  THEN 1 
        WHEN cflag = abap_false THEN 0 
        ELSE THROW cx_demo_dyn_t100( 
"                  ^ type
                MESSAGE e888(sabapdemos) 
                WITH 'Illegal value!' '' '' '' ) )

REDUCE string( INIT s = 0 FOR i = 1 UNTIL i > 10 NEXT s = i )
"      ^ type.builtin
"                   ^ variable
"                             ^ variable
"                                         ^ variable
"                                                     ^ variable
"                                                         ^ variable
REDUCE string( INIT <fs> = 0 FOR i = 1 UNTIL i > 10 NEXT s = i )
"                    ^ variable
REDUCE string( INIT text type string
"                   ^ variable
"                             ^ type.builtin
                FOR n = 10 THEN n - 1 WHILE n > 0 
"                   ^ variable
"                               ^ variable
"                                           ^ variable
                NEXT text &&= | { n }| )
"                    ^ variable
"                         ^ operator
REDUCE result( INIT res = VALUE result( max = 0 text = `Result: ` ) 
"                   ^ variable
                    sep  = `` 
"                   ^ variable
                     FOR wa IN itab 
                       NEXT res-text &&= sep )
