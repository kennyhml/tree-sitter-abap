FREE MEMORY ID 'demo'.
" ^ keyword
"      ^ keyword
"            ^ keyword
"                ^ string.special.symbol
FREE MEMORY ID memory_id.
"                ^ variable

DELETE FROM MEMORY ID 'demo'.
" ^ keyword
"       ^ keyword
"            ^ keyword
"                   ^ keyword
"                      ^ string.special.symbol
DELETE FROM DATABASE demo_indx_blob(XY) ID cluster_id.
"                    ^ type
"                                   ^ constant
"                                       ^ keyword
"                                          ^ variable
DELETE FROM SHARED BUFFER demo_indx_blob(XY) CLIENT client ID 'demo'.
"           ^ keyword
"                  ^ keyword
"                         ^ type
"                                        ^ constant
"                                            ^ keyword
"                                                   ^ variable
"                                                          ^ keyword
"                                                             ^ string.special.symbol

IMPORT DIRECTORY INTO directory FROM DATABASE demo_indx_blob(HK)
" ^ keyword
"       ^ keyword
"                 ^ keyword
"                      ^ variable
"                                ^ keyword
"                                     ^ keyword
"                                              ^ type
"                                                             ^ constant
  TO work_area CLIENT client ID 'HK'.
" ^ keyword
"    ^ variable
"              ^ keyword
"                     ^ variable
"                            ^ keyword
"                               ^ string.special.symbol
