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

METHODS get_global_authorizations FOR GLOBAL AUTHORIZATION
"       ^ function.method
  IMPORTING REQUEST requested_authorizations FOR bdef
"                   ^ variable.parameter
"                                                ^ type
  RESULT result.
"        ^ variable.parameter

METHODS get_global_authorizations2 FINAL FOR GLOBAL AUTHORIZATION
  REQUEST REFERENCE(requested_authorizations) FOR bdef~admin
"                   ^ variable.parameter
"                                                 ^ type
"                                                      ^ variable.member
  RESULT REFERENCE(result)
"                  ^ variable.parameter
  CHANGING reported TYPE DATA.
"          ^ variable.parameter.builtin

METHODS get_instance_authorizations FOR INSTANCE AUTHORIZATION
"       ^ function.method
  IMPORTING keys REQUEST requested_authorizations FOR bdef
"           ^ variable.parameter
"                        ^ variable.parameter
"                                                     ^ type
  RESULT result.
"        ^ variable.parameter

METHODS get_authorizations FINAL FOR AUTHORIZATION
  REFERENCE(keys) REQUEST REFERENCE(requested_authorizations) FOR bdef~admin
"           ^ variable.parameter
"                                   ^ variable.parameter
"                                                                 ^ type
"                                                                      ^ variable.member
  RESULT REFERENCE(result)
"                  ^ variable.parameter
  CHANGING failed TYPE DATA reported TYPE DATA.
"          ^ variable.parameter.builtin
"                           ^ variable.parameter.builtin
