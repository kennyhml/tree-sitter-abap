FORM foo.
"    ^ function
ENDFORM.


FORM fill_table TABLES t1 TYPE itab_type
"    ^ function
"                      ^ variable.parameter
"                              ^ type
                       t2 LIKE itab
"                      ^ variable.parameter
"                              ^ variable
                       t3 STRUCTURE struc. 
"                      ^ variable.parameter
"                                   ^ variable
ENDFORM.

FORM sum CHANGING ptab TYPE INDEX TABLE. 
"    ^ function
"                 ^ variable.parameter
ENDFORM.

FORM form USING using TYPE type.
"    ^ function
"               ^ variable.parameter
"                          ^ type
ENDFORM.

FORM process_data
"    ^ function
  USING    value(it_list) TYPE standard table
"          ^ keyword.modifier
"                ^ variable.parameter
  RAISING  cx_abap_invalid_value
"          ^ type
           RESUMABLE(cx_demo_exception).
"                    ^ type
ENDFORM.

PERFORM check_authority.
"       ^ function.call
PERFORM display_error using foo bar 'baz'.
"       ^ function.call
"                           ^ variable
"                               ^ variable
"                                   ^ string
PERFORM get_flights TABLES sflight_tab.
"       ^ function.call
"                          ^ variable
PERFORM test USING a1 a2 CHANGING a3 a4. 
"       ^ function.call
"                  ^ variable
"                     ^ variable
"                                 ^ variable
"                                    ^ variable
PERFORM (subr) IN PROGRAM (prog) IF FOUND. 
"        ^ variable
"                          ^ variable
PERFORM crash_prod IN PROGRAM SAPMV45A IF FOUND. 
"        ^ function.call
"                             ^ module
PERFORM sy-index OF subr_1 subr_2.
"                   ^ function
"                          ^ function
PERFORM foo(bar) IF FOUND. 
"       ^ function.call
"           ^ module
PERFORM update_database_logs ON COMMIT level lvl.
"       ^ function.call
"                                            ^ variable
