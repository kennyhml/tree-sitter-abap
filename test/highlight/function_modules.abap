CALL FUNCTION 'Z_MY_FUNCTION'.
"               ^ string.special.symbol
CALL FUNCTION z_my_function.
"               ^ variable
CALL FUNCTION 'READ_SPFLI_INTO_TABLE' 
"               ^ string.special.symbol
  EXPORTING 
    id        = 'LH' 
"   ^ variable.parameter
  IMPORTING 
    itab      = itab 
"   ^ variable.parameter
  EXCEPTIONS 
    not_found = 4. 
"   ^ variable.parameter
CALL FUNCTION 'READ_SPFLI_INTO_TABLE' 
"               ^ string.special.symbol
    TABLES tab = lv_tab. 
"          ^ variable.parameter
CALL FUNCTION 'READ_SPFLI_INTO_TABLE' 
"               ^ string.special.symbol
  parameter-table tab2
"                 ^ variable
  exception-table tab2.
"                 ^ variable
CALL FUNCTION 'READ_SPFLI_INTO_TABLE' destination 'A4H'.
"               ^ string.special.symbol
"                                                  ^ string
CALL FUNCTION 'DEMO_RFM_PARAMETERS' IN REMOTE SESSION session.
"               ^ string.special.symbol
"                                                     ^ variable
CALL FUNCTION 'DEMO_RFM_PARAMETERS' destination lv_destination
"               ^ string.special.symbol
"                                               ^ variable
    exceptions not_found = 1 message lv_message.
"               ^ variable.parameter
"                                    ^ variable
CALL FUNCTION 'TMS_MGR_FORWARD_TR_REQUEST'
"               ^ string.special.symbol
    in background unit l_unit.
"                       ^ variable
FUNCTION CHECK_SOMETHING
"        ^ module
  IMPORTING
    VALUE(IW_USER) TYPE UNAME OPTIONAL
"         ^ variable.parameter
"                       ^ type
  EXPORTING
    VALUE(EI_RETURN) TYPE BAPIRET2_T
"         ^ variable.parameter
"                          ^ type
  CHANGING
    VALUE(CI_TRKORR) TYPE TRKORRS.
"         ^ variable.parameter
"                         ^ type
ENDFUNCTION.
