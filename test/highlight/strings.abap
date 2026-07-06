|{ attr WIDTH = 6 ALIGN = RIGHT }|
"<- string
"  ^ variable
"       ^ variable.parameter.builtin
"                  ^ variable.parameter.builtin
|{ `UPPER CASE, lower case ` CASE = (<case>) }| 
"     ^ string
"                            ^ variable.parameter.builtin


`ABAP` && `is` && 'a' && 'language'
" ^ string
"          ^ string
"                  ^ string
"                          ^ string
`string` && -1 
" ^ string
"            ^ number
CONCATENATE foo 'b' foo-bar obj->attr INTO FINAL(str). 
"           ^ variable
"                ^ string
"                   ^ variable
"                       ^ variable.member
"                           ^ variable
"                                ^ variable.member

CONCATENATE LINES OF itab INTO result RESPECTING BLANKS.
"                    ^ variable
"                              ^ variable
CONCATENATE t1 t2 t3 INTO result SEPARATED BY space.
"           ^ variable
"              ^ variable
"                 ^ variable
"                         ^ variable
"                                             ^ constant.builtin
