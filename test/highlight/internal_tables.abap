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
