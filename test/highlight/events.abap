METHODS handle_changed
  FOR EVENT changed OF cl_source.
"           ^ constant
"                      ^ type

RAISE EVENT completed.
"           ^ constant

RAISE EVENT progress
"           ^ constant
  EXPORTING
    percentage = lv_percentage
"   ^ variable.parameter
"                ^ variable
    message = lv_message.
"   ^ variable.parameter
"             ^ variable

RAISE EVENT
  if_events~completed.
" ^ type
"           ^ constant
