CALL FUNCTION 'Z_MY_FUNCTION'.
"               ^ string
CALL FUNCTION z_my_function.
"               ^ variable
CALL FUNCTION 'READ_SPFLI_INTO_TABLE' 
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
    TABLES tab = lv_tab. 
"          ^ variable.parameter
CALL FUNCTION 'READ_SPFLI_INTO_TABLE' 
  parameter-table tab2
"                 ^ variable
  exception-table tab2.
"                 ^ variable
CALL FUNCTION 'READ_SPFLI_INTO_TABLE' destination 'A4H'.
"                                                  ^ string
CALL FUNCTION 'DEMO_RFM_PARAMETERS' IN REMOTE SESSION session.
"                                                     ^ variable
CALL FUNCTION 'DEMO_RFM_PARAMETERS' destination lv_destination
"                                               ^ variable
    exceptions not_found = 1 message lv_message.
"               ^ variable.parameter
"                                    ^ variable
CALL FUNCTION 'TMS_MGR_FORWARD_TRANSPORT'
    starting new task lv_task_id.
"                     ^ variable
CALL FUNCTION co_fb_name
    STARTING NEW TASK lv_number
"                     ^ variable
    DESTINATION IN GROUP lv_group.
"                        ^ variable
CALL FUNCTION 'TMS_MGR_FORWARD_TR_REQUEST'
    in background unit l_unit.
"                       ^ variable
