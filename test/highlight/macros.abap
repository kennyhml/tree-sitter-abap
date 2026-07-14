DEFINE concat.
"<- keyword
"      ^ function.macro
    &1 = &2 && &3.
"   ^ variable.parameter
"        ^ variable.parameter
"              ^ variable.parameter
END-OF-DEFINITION.

DEFINE operation. 
"      ^ function.macro
  result = &1 + &9. 
" ^ variable
"          ^ variable.parameter
"               ^ variable.parameter
  output   &1 &2 &3 result. 
" ^ function.macro
"          ^ variable.parameter
"             ^ variable.parameter
"                 ^ variable.parameter
"                   ^ variable
END-OF-DEFINITION. 
