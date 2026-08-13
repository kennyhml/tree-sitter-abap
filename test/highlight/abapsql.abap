SELECT SINGLE FOR UPDATE source~field, source~*
"<- keyword
"      ^ keyword
"             ^ keyword
"                 ^ keyword
"                         ^ type
"                                ^ variable.member
"                                       ^ type
  FROM source
" ^ keyword
"      ^ type
  INTO CORRESPONDING FIELDS OF @result.
" ^ keyword
"      ^ keyword
"                    ^ keyword
"                           ^ keyword
"                              ^ punctuation.special
"                               ^ variable

SELECT FROM source FIELDS DISTINCT field
"<- keyword
"      ^ keyword
"           ^ type
"                  ^ keyword
"                         ^ keyword
"                                  ^ variable.member
  INTO TABLE @results PACKAGE SIZE 10.
" ^ keyword
"      ^ keyword
"            ^ punctuation.special
"             ^ variable
"                      ^ keyword
"                              ^ keyword
"                                   ^ number

SELECT (columns) FROM source
"<- keyword
"       ^ variable
"                ^ keyword
"                     ^ type
  APPENDING TABLE @results PACKAGE SIZE package_size.
" ^ keyword
"           ^ keyword
"                 ^ punctuation.special
"                  ^ variable
"                           ^ keyword
"                                   ^ keyword
"                                        ^ variable

SELECT field FROM source INTO (@first_result, @second_result).
"<- keyword
"      ^ variable.member
"            ^ keyword
"                 ^ type
"                        ^ keyword
"                              ^ punctuation.special
"                               ^ variable
"                                             ^ punctuation.special
"                                              ^ variable

SELECT field_a field_b source~field_c FROM source
"<- keyword
"      ^ variable.member
"               ^ variable.member
"                       ^ type
"                              ^ variable.member
"                                      ^ keyword
"                                           ^ type
  INTO (@first_result, @second_result, @third_result).
" ^ keyword
"       ^ punctuation.special
"        ^ variable
"                      ^ punctuation.special
"                       ^ variable
"                                      ^ punctuation.special
"                                       ^ variable

SELECT field FROM source INTO @result.
"<- keyword
"      ^ variable.member
"            ^ keyword
"                 ^ type
"                        ^ keyword
"                             ^ punctuation.special
"                              ^ variable
ENDSELECT.
"<- keyword
