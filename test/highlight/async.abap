CALL FUNCTION 'Z_ASYNC_PROCESS'
"               ^ string.special.symbol
  STARTING NEW TASK lv_task_id
"                   ^ variable
  CALLING lo_handler->on_end_of_task ON END OF TASK
"         ^ variable
"                     ^ function.method
  EXPORTING
    iv_request = lv_request.
"   ^ variable.parameter
"                ^ variable

CALL FUNCTION 'Z_ASYNC_PROCESS'
"               ^ string.special.symbol
  STARTING NEW TASK lv_task_id
"                   ^ variable
  PERFORMING on_end_of_task ON END OF TASK.
"            ^ function.subroutine

CALL FUNCTION co_fb_name
  STARTING NEW TASK lv_task_id
"                   ^ variable
  DESTINATION IN GROUP lv_group.
"                      ^ variable

WAIT FOR ASYNCHRONOUS TASKS
  UNTIL tasks_done = abap_true.
"       ^ variable
"                    ^ constant.builtin

WAIT FOR MESSAGING CHANNELS
  UNTIL message_received = abap_true
"       ^ variable
"                          ^ constant.builtin
  UP TO timeout SECONDS.
"       ^ variable

WAIT FOR PUSH CHANNELS
  UNTIL message_received = abap_true.
"       ^ variable
"                          ^ constant.builtin

WAIT FOR ASYNCHRONOUS TASKS MESSAGING CHANNELS PUSH CHANNELS
  UNTIL all_done =
"       ^ variable
    abap_true
"   ^ constant.builtin
  UP TO timeout SECONDS.
"       ^ variable
