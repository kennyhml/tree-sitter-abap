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
