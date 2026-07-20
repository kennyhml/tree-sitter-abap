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
