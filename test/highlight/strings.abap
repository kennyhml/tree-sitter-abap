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
REPLACE foo in bar with baz.
"       ^ variable
"              ^ variable
"                       ^ variable
REPLACE FIRST OCCURRENCE OF 'a' in str with 'b'.
"                            ^ string
"                                  ^ variable
"                                            ^ string
REPLACE PCRE 'u*' IN text WITH 'x'.
"             ^ string.regexp
"                    ^ variable
"                               ^ string
REPLACE ALL OCCURRENCES OF REGEX `[A-Z]` IN str WITH '`' IGNORING CASE. 
"                                 ^ string.regexp
REPLACE ALL OCCURRENCES OF 'know' IN text1 WITH 'should know that' 
  REPLACEMENT COUNT  cnt
"                    ^ variable
  REPLACEMENT OFFSET off  
"                    ^ variable
  REPLACEMENT LENGTH len . 
"                    ^ variable
