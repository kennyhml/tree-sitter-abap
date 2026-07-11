|{ attr WIDTH = 6 ALIGN = RIGHT }|
"<- string
"  ^ variable
"       ^ variable.parameter.builtin
"                  ^ variable.parameter.builtin
|{ `UPPER CASE, lower case ` CASE = (<case>) }| 
"     ^ string
"                            ^ variable.parameter.builtin
|In this the \{ bracket \} are escaped to not cause issues| 
" ^ string
"            ^ string.escape
"                       ^ string.escape
`ABAP` && `is` && 'a' && 'language' && 'kindof'
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
SHIFT str.
"     ^ variable
SHIFT text BY off PLACES.
"     ^ variable
"             ^ variable
SHIFT txt RIGHT DELETING TRAILING foo.
"     ^ variable
"                                 ^ variable
SPLIT text1 AT ':' INTO TABLE segments. 
"     ^ variable
"                             ^ variable
SPLIT text1 AT ':' INTO foo bar baz data(rest). 
"     ^ variable
"                       ^ variable
"                           ^ variable
"                               ^ variable
"                                        ^ variable
FIND 'a' in str.
"           ^ variable
FIND ALL OCCURRENCES OF foo IN SECTION OFFSET off LENGTH len OF str.
"                       ^ variable
"                                             ^ variable
"                                                        ^ variable
"                                                               ^ variable
FIND ALL OCCURRENCES OF PCRE `[A-Z]` IN str IGNORING CASE. 
"                             ^ string.regexp
FIND REGEX `(\w+)\W+\1\W+(\w+)\W+\2` 
"           ^ string.regexp
     IN text 
"       ^ variable
     IGNORING CASE 
     MATCH OFFSET moff
"                 ^ variable
     MATCH LENGTH mlen
"                 ^ variable
     SUBMATCHES s1 FINAL(s2).
"               ^ variable
"                        ^ variable
CONVERT TEXT text INTO SORTABLE CODE hex.
"            ^ variable
"                                    ^ variable
OVERLAY text1 WITH text2 ONLY mask.
"       ^ variable
"                  ^ variable
"                             ^ variable
TRANSLATE text USING 'ABBAabba'.
"         ^ variable
