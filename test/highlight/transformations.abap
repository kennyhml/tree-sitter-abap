CALL TRANSFORMATION z_serialize
"                   ^ function.call
  PARAMETERS pretty = abap_true
"            ^ variable.parameter
"                     ^ constant.builtin
  OPTIONS clear = 'all'
"         ^ keyword
  SOURCE root = ls_data
"        ^ variable.parameter
"               ^ variable
  RESULT XML DATA(lv_xml).
"                 ^ variable

CALL TRANSFORMATION (lv_transformation)
"                    ^ variable
  PARAMETERS (lt_parameters)
"             ^ variable
  SOURCE XML lv_xml
"            ^ variable
  RESULT root = ls_result.
"        ^ variable.parameter
"               ^ variable
