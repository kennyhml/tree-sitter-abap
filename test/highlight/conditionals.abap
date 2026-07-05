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
