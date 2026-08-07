METHODS det_on_save FOR DETERMINE ON SAVE 
"       ^ function.method
  IMPORTING keys FOR bdef~det_save. 
"           ^ variable.parameter
"                    ^ type
"                         ^ function.method

METHODS det_on_save2 FOR DETERMINE ON MODIFY 
  IMPORTING reference(keys) FOR bdef~det_save2 
"                     ^ variable.parameter
"                               ^ type
"                                    ^ function.method
  CHANGING reported TYPE DATA. 
"          ^ variable.parameter.builtin
