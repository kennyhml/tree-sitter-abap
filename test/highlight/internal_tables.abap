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
APPEND INITIAL LINE TO foo-bar REFERENCE INTO DATA(data)
"                      ^ variable
"                          ^ variable.member
"                                                  ^ variable
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
MODIFY TABLE itab USING KEY skey FROM wa.
"            ^ variable
"                           ^ constant
"                                     ^ variable
MODIFY itab USING KEY loop_key FROM wa.
"                     ^ constant.builtin
MODIFY itab FROM wa INDEX idx TRANSPORTING comp.
"      ^ variable
"                ^ variable
"                         ^ variable
"                                          ^ variable.member
MODIFY itab FROM wa USING KEY skey TRANSPORTING status WHERE status = value.
"                             ^ constant
"                                               ^ variable.member
"                                                               ^ variable.member
"                                                                     ^ variable
MODIFY TABLE itab FROM wa REFERENCE INTO DATA(line).
"            ^ variable
"                      ^ variable
"                                             ^ variable
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
READ TABLE itab WITH KEY table_line->parent = container into result.
"                        ^ variable.member
"                                             ^ variable
"                                                            ^ variable
READ TABLE spfli_tab into res WITH TABLE KEY primary_key COMPONENTS carrid = 'LH' connid = '400'.
"                                            ^ constant
"                                                                   ^ variable.member
"                                                                                 ^ variable.member
READ TABLE spfli_tab FROM spfli_key USING KEY city_key into result.
"          ^ variable
"                         ^ variable
"                                             ^ constant
READ TABLE itab INTO text_short WHERE table_line = text_long.
"                                     ^ variable.member
READ TABLE sflight_tab INDEX 1 INTO sflight_wa COMPARING foo bar baz.
"                                                        ^ variable.member
"                                                            ^ variable.member
"                                                                ^ variable.member
itab[ key primary_key INDEX 3 ]
"         ^ constant
itab[ b = 2 country = 'DE' ]
"     ^ variable.member
"           ^ variable.member
itab[ TABLE KEY primary_key COMPONENTS a = 1 b = 2 ].
"               ^ constant
"                                      ^ variable.member
"                                            ^ variable.member
itab[ key (key_name) (comp_name) = 1 ]
"          ^ variable
"                     ^ variable
value #( itab[ 1 ] DEFAULT default) ). 
"                          ^ variable

value #( itab[ 1 ] OPTIONAL ). 
"         ^ variable
struc_i = it_k[ KEY primary_key COMPONENTS num = 1 ].
"                   ^ constant
"                                          ^ variable.member
itab[ inner-carrid = 'AAA' ]
"     ^ variable.member
itab[ obj->carrid = 'AAA' ]
"     ^ variable.member
itab[ field1+off(5) = 'AABBC' ].
"     ^ variable.member

VALUE carriers( FOR wa IN scarr_tab ( carrid = wa-carrid ) ). 
"                   ^ variable
"                         ^ variable
"                                     ^ variable.member
"                                              ^ variable
"                                                 ^ variable.member
VALUE carriers( FOR wa IN scarr_tab INDEX INTO i ( carrid = wa-carrid no = i ) ). 
"                                              ^ variable
VALUE #( FOR wa IN messages WHERE ( (cond_tab) ) ( wa ) ). 
"                                    ^ variable
"                                                  ^ variable
VALUE #( FOR <fs> IN itab INDEX INTO tabix 
      USING KEY sortkey FROM a TO b STEP -2 
"               ^ constant
"                            ^ variable
            ( tabix = tabix value = <fs> ) )
VALUE group_keys( FOR GROUPS carrier OF wa IN spfli GROUP BY wa-carrid ( carrier ) )
"                            ^ variable
"                                                            ^ variable
VALUE #( FOR GROUPS grp OF wa IN itab GROUP BY wa let foo = grp-carrid in ( foo ) ).
"                                              ^ variable
"                                                     ^ variable
"                                                           ^ variable
"                                                               ^ variable.member
loop at requests into request.
"       ^ variable
endloop.

LOOP AT scarr_tab ASSIGNING <scarr_line> WHERE carrname CP name. 
"       ^ variable
"                                              ^ variable.member
"                                                       ^ keyword.operator
"                                                          ^ variable
ENDLOOP.

LOOP AT itab INTO FINAL(number2) USING KEY key. 
"                                          ^ constant
ENDLOOP. 

LOOP AT itab ASSIGNING FIELD-SYMBOL(<fs>). 
  AT NEW comp1.
"        ^ variable.member
  ENDAT.
  AT END OF comp1.
"           ^ variable.member
  ENDAT.
ENDLOOP. 

LOOP AT itab ASSIGNING FIELD-SYMBOL(<wa>) 
             GROUP BY ( key1 = <wa>-key1 key2 = <wa>-key2 ). 
"                       ^ variable.member
"                                        ^ variable.member
ENDLOOP. 

LOOP AT GROUP key ASSIGNING <members> WHERE cityfrom = 'NEW YORK'. 
"             ^ variable
"                                           ^ variable.member
ENDLOOP. 

FILTER res( messages EXCEPT WHERE sprsl = 'D' )
"<- keyword
"      ^ type
"           ^ variable
"                                 ^ variable.member
" TODO: Technically this is a mapping between table types and both sides are members
FILTER #( spfli_tab EXCEPT USING KEY carr_city 
"         ^ variable
"                                    ^ constant
            WHERE carrid = carrid AND 
"                 ^ variable.member
"                          ^ variable
                cityfrom = cityfrom ). 
"               ^ variable.member
"                          ^ variable
MOVE-CORRESPONDING itab1 TO itab2. 
"                  ^ variable
"                           ^ variable
itab = CORRESPONDING flights( spfli_tab )
"      ^ keyword
"                    ^ type
"                             ^ variable
target2 = CORRESPONDING #( EXACT src ). 
"                          ^ keyword
CORRESPONDING flights( deep spfli_tab )
"                      ^ keyword
"                                ^ variable
itab = CORRESPONDING #( BASE ( itab ) itab3 ).
"                       ^ keyword
"                              ^ variable
"                                     ^ variable
CORRESPONDING itab2( itab MAPPING col1 = table_line )
"                                 ^ variable.member
"                                        ^ variable.member
CORRESPONDING itab2( itab MAPPING col1 = default foo )
"                                 ^ variable.member
"                                                ^ variable
CORRESPONDING itab2( itab MAPPING col1 = default random=>randint( ) )
"                                 ^ variable.member
"                                                        ^ function.method.call
CORRESPONDING #( struct1 EXCEPT col2 col3 ).
"                               ^ variable.member
"                                    ^ variable.member
CORRESPONDING #( struct1 EXCEPT * ).
"                               ^ operator
CORRESPONDING #( str_deep1 mapping 
                ( titi = itab mapping d = c except * ) ).
"                 ^ variable.member
"                        ^ variable.member
"                                     ^ variable.member
"                                         ^ variable.member
CORRESPONDING itab1( itab1 FROM itab2 USING value = value ). 
"                               ^ variable
"                                           ^ variable.member
"                                                   ^ variable.member
COLLECT wa into itab reference into foo.
"       ^ variable
"               ^ variable
"                                   ^ variable
REPLACE ALL OCCURRENCES OF foo IN TABLE bar WITH baz.
"                          ^ variable
"                                        ^ variable
"                                                ^ variable
FIND FIRST OCCURRENCE OF PCRE '[fF][oO][bB]' IN TABLE bar.
"                              ^ string.regexp
"                                                     ^ variable
MODIFY TABLE itab FROM wa.
"            ^ variable
"                      ^ variable

MODIFY itab FROM VALUE line( col2 = 0 ) TRANSPORTING col2 WHERE col2 < 0.
"      ^ variable
"                      ^ type
"                            ^ variable.member
"                                                    ^ variable.member
"                                                               ^ variable.member
MODIFY itab FROM wa USING KEY mkey.
"      ^ variable
"                ^ variable
"                             ^ constant
MODIFY itab FROM wa TRANSPORTING col2 where col1 < foo.
"      ^ variable
"                ^ variable
"                                ^ variable.member
"                                           ^ variable.member
"                                                  ^ variable
