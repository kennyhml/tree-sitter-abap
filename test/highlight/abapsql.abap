SELECT SINGLE FOR UPDATE source~field, source~*
"<- keyword
"                 ^ keyword
"                         ^ type
"                                ^ variable.member
"                                       ^ type
  FROM source
"      ^ type
  INTO CORRESPONDING FIELDS OF @result.
"                              ^ punctuation.special
"                               ^ variable

SELECT FROM source FIELDS DISTINCT field
"           ^ type
"                                  ^ variable.member
  INTO TABLE @results PACKAGE SIZE 10.
"             ^ variable

SELECT (columns) FROM source
"       ^ variable
"                     ^ type
  APPENDING TABLE @results PACKAGE SIZE package_size.
"                  ^ variable
"                                        ^ variable

SELECT field FROM source INTO (@first_result, @second_result).
"      ^ variable.member
"                 ^ type
"                               ^ variable
"                                              ^ variable

SELECT field_a field_b source~field_c FROM source
"      ^ variable.member
"               ^ variable.member
"                       ^ type
"                              ^ variable.member
"                                           ^ type
  INTO (@first_result, @second_result, @third_result).
"        ^ variable
"                       ^ variable
"                                       ^ variable

SELECT field FROM source INTO @result.
"      ^ variable.member
"                 ^ type
"                              ^ variable
ENDSELECT.
"<- keyword

SELECT * FROM source
"             ^ type
  WHERE field = @( value )
"       ^ variable.member
"               ^ punctuation.special
"                  ^ variable
  INTO TABLE @results.
"             ^ variable

SELECT CAST( amount AS DEC( 15, 2 ) ) AS converted,
"      ^ function.call
"            ^ variable.member
"                      ^ type.builtin
"                                        ^ variable.member
       COALESCE( description, 'N/A' ) AS label
"      ^ function.call
"                ^ variable.member
"                                        ^ variable.member
  FROM prices
  INTO TABLE @result.
"             ^ variable

SELECT * FROM spfli
"             ^ type
  WHERE NOT ( spfli~carrid = @carrier OR spfli~connid BETWEEN 100 AND 200 )
"             ^ type
"                   ^ variable.member
"                             ^ variable
"                                         ^ type
"                                               ^ variable.member
    AND spfli~cityfrom NOT LIKE @pattern ESCAPE '#'
"       ^ type
"             ^ variable.member
"                                ^ variable
     OR (condition)
"        ^ variable
  INTO TABLE @results.
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
"                        ^ variable
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

SELECT source~\_spfli\_sairport[ (1) INNER WHERE id = @airport_id ]-name
"      ^ type
"             ^ operator
"              ^ type
"                     ^ type
"                                                ^ variable.member
"                                                      ^ variable
"                                                                   ^ variable.member
  FROM source INTO TABLE @results.

SELECT \_assoc(p_arg = @argument)-field FROM source INTO TABLE @results.
"       ^ type
"              ^ variable.parameter
"                       ^ variable
"                                 ^ variable.member

SELECT scarr~carrname AS carrier_name
"      ^ type
"            ^ variable.member
"                        ^ variable.member
  FROM demo_cds_assoc_scarr AS scarr
"      ^ type
"                              ^ type
  WHERE scarr~carrid = 'LH'
"       ^ type
"             ^ variable.member
  INTO TABLE @results.

SELECT carrid, connid FROM spfli
  GROUP BY carrid, GROUPING SETS ( (), (carrid), (connid) )
" ^ keyword
"          ^ variable.member
"                  ^ keyword
"                                       ^ variable.member
"                                                 ^ variable.member
  HAVING carrid = @carrier AND connid IS NOT NULL
" ^ keyword
"        ^ variable.member
"                  ^ variable
"                              ^ variable.member
  INTO TABLE @results.

SELECT carrid, connid FROM spfli
  ORDER BY carrid ASCENDING, connid DESCENDING NULLS LAST
"          ^ variable.member
"                            ^ variable.member
"                                   ^ keyword
  INTO TABLE @results.

SELECT col1 + @offset AS total, ( col2 * 2 ) - -col3 AS adjusted
"      ^ variable.member
"              ^ variable
"                        ^ variable.member
"                                 ^ variable.member
"                                               ^ variable.member
"                                                       ^ variable.member
  FROM source
  WHERE col1 + @offset > col2
"       ^ variable.member
"               ^ variable
"                        ^ variable.member
  GROUP BY col1 + @offset
"          ^ variable.member
"                  ^ variable
  HAVING col1 + @offset > @minimum
"        ^ variable.member
"                ^ variable
"                          ^ variable
  ORDER BY ( col1 - col2 ) / 2 DESCENDING
"            ^ variable.member
"                   ^ variable.member
  INTO TABLE @results.
"             ^ variable
