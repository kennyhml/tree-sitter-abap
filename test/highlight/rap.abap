METHODS det_on_save FOR DETERMINE ON SAVE 
"       ^ function.method
  IMPORTING keys FOR bdef~det_save. 
"           ^ variable.parameter
"                    ^ type
"                         ^ variable.member

METHODS det_on_save2 FOR DETERMINE ON MODIFY 
  IMPORTING reference(keys) FOR bdef~det_save2 
"                     ^ variable.parameter
"                               ^ type
"                                    ^ variable.member
  CHANGING reported TYPE DATA. 
"          ^ variable.parameter.builtin

METHODS lock FOR LOCK
"       ^ function.method
  IMPORTING keys FOR LOCK bdef.
"           ^ variable.parameter
"                         ^ type

METHODS lock2 FINAL FOR LOCK
  REFERENCE(keys) FOR LOCK /DMO/I_TRAVEL
"           ^ variable.parameter
"                          ^ type
  CHANGING failed TYPE DATA reported TYPE DATA.
"          ^ variable.parameter.builtin
"                           ^ variable.parameter.builtin

METHODS early_numbering FOR NUMBERING
"       ^ function.method
  IMPORTING entities FOR CREATE bdef.
"           ^ variable.parameter
"                               ^ type

METHODS early_numbering_items FINAL FOR NUMBERING
  REFERENCE(entities) FOR CREATE /DMO/I_TRAVEL\_Booking
"           ^ variable.parameter
"                                ^ type
  CHANGING mapped TYPE DATA failed TYPE DATA reported TYPE DATA.
"          ^ variable.parameter.builtin
"                           ^ variable.parameter.builtin
"                                            ^ variable.parameter.builtin

METHODS create_entity FOR MODIFY
"       ^ function.method
  entities FOR CREATE bdef.
" ^ variable.parameter
"                     ^ type

METHODS create_items FOR MODIFY
  entities FOR CREATE bdef\_items.
" ^ variable.parameter
"                     ^ type
"                          ^ type

METHODS update FINAL FOR MODIFY
  REFERENCE(entities) FOR UPDATE /DMO/I_TRAVEL
"           ^ variable.parameter
"                                ^ type
  CHANGING failed TYPE DATA reported TYPE DATA mapped TYPE DATA.
"          ^ variable.parameter.builtin
"                           ^ variable.parameter.builtin
"                                              ^ variable.parameter.builtin

METHODS execute_action FOR MODIFY
"       ^ function.method
  entities FOR ACTION bdef~do_something
" ^ variable.parameter
"                     ^ type
"                          ^ variable.member
  REQUEST REFERENCE(request)
"                   ^ variable.parameter
  RESULT result.
"        ^ variable.parameter

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

METHODS get_global_features FOR GLOBAL FEATURES
"       ^ function.method
  IMPORTING REQUEST requested_features FOR bdef
"                   ^ variable.parameter
"                                          ^ type
  RESULT result.
"        ^ variable.parameter

METHODS get_global_features2 FINAL FOR GLOBAL FEATURES
  REQUEST REFERENCE(requested_features) FOR bdef~admin
"                   ^ variable.parameter
"                                           ^ type
"                                                ^ variable.member
  RESULT REFERENCE(result)
"                  ^ variable.parameter
  CHANGING reported TYPE DATA.
"          ^ variable.parameter.builtin

METHODS get_instance_features FOR INSTANCE FEATURES
"       ^ function.method
  IMPORTING keys REQUEST requested_features FOR bdef
"           ^ variable.parameter
"                        ^ variable.parameter
"                                               ^ type
  RESULT result.
"        ^ variable.parameter

METHODS get_features FINAL FOR FEATURES
  REFERENCE(keys) REQUEST REFERENCE(requested_features) FOR bdef~admin
"           ^ variable.parameter
"                                   ^ variable.parameter
"                                                           ^ type
"                                                                ^ variable.member
  RESULT REFERENCE(result)
"                  ^ variable.parameter
  CHANGING failed TYPE DATA reported TYPE DATA.
"          ^ variable.parameter.builtin
"                           ^ variable.parameter.builtin
