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

SELECT * FROM source
"<- keyword
"      ^ operator
"        ^ keyword
"             ^ type
  WHERE field = @( value )
" ^ keyword
"       ^ variable.member
"               ^ punctuation.special
"                  ^ variable
  INTO TABLE @results.
" ^ keyword
"      ^ keyword
"            ^ punctuation.special
"             ^ variable

SELECT * FROM spfli
"             ^ type
  WHERE NOT ( spfli~carrid = @carrier OR spfli~connid BETWEEN 100 AND 200 )
"             ^ type
"                   ^ variable.member
"                            ^ punctuation.special
"                             ^ variable
"                                         ^ type
"                                               ^ variable.member
"                                                              ^ number
"                                                                      ^ number
    AND spfli~cityfrom NOT LIKE @pattern ESCAPE '#'
"       ^ type
"             ^ variable.member
"                               ^ punctuation.special
"                                ^ variable
"                                               ^ string
     OR (condition)
"        ^ variable
  INTO TABLE @results.
"            ^ punctuation.special
"             ^ variable

SELECT * FROM source
"             ^ type
  WHERE source~field IN (
"       ^ type
"              ^ variable.member
    SELECT field FROM lookup )
"          ^ variable.member
"                     ^ type
    AND (foo, bar) IN ((@foo, @bar), (@baz, @baz2))
"        ^ variable.member
"             ^ variable.member
"                       ^ punctuation.special
"                        ^ variable
"                                           ^ punctuation.special
"                                            ^ variable
  INTO TABLE @results.

SELECT * FROM sflight
  WHERE price > ALL ( SELECT price FROM sflight )
"       ^ variable.member
"               ^ keyword
"                            ^ variable.member
    AND price > ANY ( SELECT price FROM sflight )
"               ^ keyword
    AND price > SOME ( SELECT price FROM sflight )
"               ^ keyword
  INTO TABLE @results.
