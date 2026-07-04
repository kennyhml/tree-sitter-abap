APPEND 'foo' TO itab. 
"       ^ string
"               ^ variable
APPEND seats TO seats_tab SORTED BY foo. 
"      ^ variable
"                                   ^ variable.member
APPEND LINES OF itab1 TO itab2. 
"               ^ variable
"                        ^ variable
APPEND seats TO seats_tab SORTED BY comp->attr. 
"      ^ variable
"                                   ^ variable.member
"                                         ^ variable.member
APPEND seats TO seats_tab SORTED BY struct-member. 
"      ^ variable
"                                   ^ variable.member
"                                          ^ variable.member
APPEND INITIAL LINE TO foo-bar REFERENCE INTO(data). 
"                      ^ variable
"                          ^ variable.member
"                                             ^ variable
DELETE itab WHERE foo IS INITIAL.
"      ^ variable
"                 ^ variable.member
DELETE itab INDEX 1 USING KEY skey.
"      ^ variable
"                             ^ constant
DELETE itab using key loop_key. 
"                     ^ constant.builtin
DELETE TABLE scarr_tab FROM wa.
"            ^ variable
"                           ^ variable
DELETE TABLE scarr_tab WITH TABLE KEY carrid = carrid.
"                                     ^ variable.member
"                                              ^ variable
DELETE TABLE spfli_tab WITH TABLE KEY skey COMPONENTS cityfrom = 'FRANKFURT'.
"                                     ^ constant
"                                                     ^ variable.member
DELETE spfli_tab USING KEY skey WHERE cityfrom = 'FRANKFURT' and foo is initial.
"                                     ^ variable.member
"                                                                ^ variable.member
DELETE ADJACENT DUPLICATES FROM dokhl_tab COMPARING object. 
"                                                   ^ variable.member
INSERT LINES OF itab USING KEY skey INTO itab INDEX 1. 
"               ^ variable
"                              ^ constant
"                                        ^ variable
INSERT connection INTO TABLE connection_tab. 
"      ^ variable
"                            ^ variable
SORT carriers.
"    ^ variable
SORT itab DESCENDING. 
"         ^ keyword
SORT itab BY col1 ASCENDING col2 DESCENDING. 
"            ^ variable.member
"                           ^ variable.member
SORT itab BY col1 col2-foo col3 (col4). 
"            ^ variable.member
"                 ^ variable.member
"                          ^ variable.member
"                                ^ variable
SORT <itab> BY (order). 
"     ^ variable
"               ^ variable
