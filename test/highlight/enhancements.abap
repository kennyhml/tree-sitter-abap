GET BADI lo_badi.
"        ^ variable

GET BADI lo_badi
"        ^ variable
  FILTERS country = lv_country
"         ^ variable.parameter
"                   ^ variable
          airline = 'LH'.
"         ^ variable.parameter
"                   ^ string

GET BADI lo_badi TYPE (lv_badi_name).
"        ^ variable
"                      ^ variable

GET BADI lo_badi TYPE (lv_badi_name)
"        ^ variable
"                      ^ variable
  FILTER-TABLE lt_filters
"              ^ variable
  CONTEXT lo_context.
"         ^ variable

CALL BADI lo_badi->execute.
"         ^ variable
"                  ^ function.method

CALL BADI lo_badi->calculate
"         ^ variable
"                  ^ function.method
  EXPORTING
    iv_input = lv_input
"   ^ variable.parameter
"              ^ variable
  IMPORTING
    ev_output = lv_output.
"   ^ variable.parameter
"               ^ variable

CALL BADI lo_badi->(lv_method)
"         ^ variable
"                   ^ variable
  PARAMETER-TABLE lt_parameters
"                 ^ variable
  EXCEPTION-TABLE lt_exceptions.
"                 ^ variable

ENHANCEMENT 1 z_source_plugin.
"           ^ number
"             ^ constant
  result = source.
" ^ variable
"          ^ variable
ENDENHANCEMENT.

ENHANCEMENT-POINT z_dynamic_point SPOTS z_primary_spot.
"                 ^ constant
"                                       ^ constant

ENHANCEMENT-POINT /example/multi_point
"                 ^ constant
  SPOTS z_primary_spot /example/secondary_spot STATIC INCLUDE BOUND.
"       ^ constant
"                      ^ constant
