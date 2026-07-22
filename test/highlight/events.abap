EVENTS changed.
"      ^ constant

CLASS-EVENTS completed
"            ^ constant
  EXPORTING
    VALUE(result)
"         ^ variable.parameter
      TYPE string
"          ^ type.builtin
    VALUE(message)
"         ^ variable.parameter
      TYPE string OPTIONAL.
"          ^ type.builtin

EVENTS:
  minimized,
" ^ constant
  maximized.
" ^ constant

METHODS handle_changed
  FOR EVENT changed OF cl_source.
"           ^ constant
"                      ^ type
METHODS handle_double_click 
        FOR EVENT picture_dblclick OF cl_gui_picture 
"                 ^ constant
"                                     ^ type
        IMPORTING mouse_pos_x mouse_pos_y sender. 
"                 ^ variable.parameter
"                             ^ variable.parameter
"                                         ^ variable.parameter.builtin

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
