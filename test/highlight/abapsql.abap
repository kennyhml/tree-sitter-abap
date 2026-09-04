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

SELECT NULL AS missing_value FROM source INTO TABLE @result.
"      ^ constant.builtin

SELECT c~carrid, p~connid
  FROM scarr AS c
"      ^ type
  INNER JOIN spfli AS p ON c~carrid = p~carrid
"            ^ type
  INTO TABLE @result.

SELECT SUM( amount ) OVER(
"      ^ function.call
"           ^ variable.member
       PARTITION BY currency
"                   ^ variable.member
       ORDER BY posting_date
"               ^ variable.member
       ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW ) AS running_total
  FROM postings
"      ^ type
  INTO TABLE @result.

SELECT first_name &&
"      ^ variable.member
       ' ' &&
"      ^ string
       last_name AS full_name
"      ^ variable.member
"                   ^ variable.member
  FROM people
  INTO TABLE @result.

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
"        ^ type
"               ^ variable.member
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

SELECT * FROM parameter_view(
"             ^ type
  p = @argument,
" ^ variable.parameter
"      ^ variable
  p_text = 'X' ) AS source
" ^ variable.parameter
"          ^ string
"                   ^ type
  INTO TABLE @result.

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

SELECT field FROM source
  INTO FIELDS OF TABLE @result.
"      ^ variable
"             ^ variable

SELECT FROM spfli AS flight
"           ^ type
"                    ^ type
  FIELDS flight~carrid, flight~connid
"        ^ type
"               ^ variable.member
  FOR ALL ENTRIES in @carriers
" ^ keyword
"         ^ keyword
"                    ^ punctuation.special
"                     ^ variable
  WHERE flight~carrid = @carriers-carrid
"       ^ type
"              ^ variable.member
"                       ^ punctuation.special
"                        ^ variable
"                                 ^ variable.member
  INTO TABLE @results.

SELECT carrid FROM scarr
  FOR ALL ENTRIES IN @<carriers>
"                    ^ punctuation.special
"                      ^ variable
  WHERE carrid = @<carriers>-carrid
"       ^ variable.member
"                ^ punctuation.special
"                  ^ variable
"                            ^ variable.member
  INTO TABLE @results.

SELECT * FROM flights ORDER BY flight_date INTO TABLE @results
  UP TO @page_size ROWS OFFSET @( skip ).
" ^ keyword
"    ^ keyword
"       ^ punctuation.special
"        ^ variable
"                  ^ keyword
"                       ^ keyword
"                              ^ punctuation.special
"                                 ^ variable

SELECT * FROM scarr INTO TABLE @results
  OPTIONS USING CLIENTS IN T000 PRIVILEGED ACCESS
" ^ keyword
"         ^ keyword
"               ^ keyword
"                       ^ keyword
"                          ^ type
"                               ^ keyword
"                                          ^ keyword
  BYPASSING BUFFER CONNECTION R/3*MY_CONN.
" ^ keyword
"           ^ keyword
"                  ^ keyword
"                             ^ constant

SELECT * FROM scarr
  %_HINTS HDB 'USE INDEX' ORACLE @oracle_hint
" ^ keyword
"          ^ constant
"              ^ string
"                          ^ constant
"                                 ^ punctuation.special
"                                  ^ variable
  INTO TABLE @results.

SELECT carrid FROM scarr
  UNION ALL SELECT carrid FROM spfli
" ^ keyword
"       ^ keyword
"           ^ keyword
"                  ^ variable.member
  INTERSECT DISTINCT SELECT carrid FROM sflight
" ^ keyword
"           ^ keyword
  EXCEPT SELECT carrid FROM sairport
" ^ keyword
  ORDER BY carrid DESCENDING
"          ^ variable.member
  INTO TABLE @results.

WITH
"<- keyword
  +connections( carrier, connection ) AS (
" ^ operator
"  ^ type
"               ^ variable.member
"                        ^ variable.member
    SELECT carrid, connid FROM spfli )
"          ^ variable.member
"                  ^ variable.member
"                              ^ type
  SELECT carrier, connection FROM +connections INTO TABLE @results.
"        ^ variable.member
"                 ^ variable.member
"                                 ^ operator
"                                   ^ type
"                                                         ^ punctuation.special
"                                                          ^ variable

WITH
  +filtered_connections AS (
    SELECT * FROM demo_cds_assoc_spfli AS connections ),
  +carriers AS (
    SELECT * FROM demo_cds_expose_assoc AS carriers )
    WITH ASSOCIATIONS (
"   ^ keyword
"        ^ keyword
      carriers~\_spfli AS _filtered_connections
"     ^ type
"                         ^ type
        REDIRECTED TO +filtered_connections VIA connections )
"                         ^ type 
"                                               ^ type 
  SELECT * FROM +carriers INTO TABLE @results.

WITH
  +connections AS (
    SELECT carrid FROM spfli )
    WITH ASSOCIATIONS (
      JOIN MANY TO ONE
        scarr AS _carrier
"       ^ type
"                ^ type
        ON +connections~carrid = _carrier~carrid )
"           ^ type
"                       ^ variable.member
"                                ^ type
"                                         ^ variable.member
  SELECT * FROM +connections INTO TABLE @results.

WITH
  +dynamic_connections AS (
    SELECT carrid FROM spfli )
    WITH ASSOCIATIONS (association_syntax)
"                      ^ variable
  SELECT * FROM +dynamic_connections INTO TABLE @results.

WITH
  +association_source AS (
    SELECT carrid FROM demo_cds_expose_assoc )
    WITH ASSOCIATIONS ( demo_cds_expose_assoc~\_spfli )
  SELECT * FROM +association_source\_spfli AS flights
"               ^ operator
"                ^ type
"                                  ^ operator
"                                   ^ type
"                                             ^ type
    INTO TABLE @results.

WITH
  +cte AS ( SELECT mandt, carrid, carrname
" ^ operator
"  ^ type
                   FROM scarr USING ALL CLIENTS )
"                       ^ type
  SELECT *
         FROM +cte DECLARE CLIENT mandt
"             ^ operator
"              ^ type
"                                 ^ variable.member
                   USING CLIENT @client
"                                ^ variable
"                               ^ punctuation.special
         INTO TABLE @FINAL(result).

OPEN CURSOR WITH HOLD @DATA(dbcur) FOR
"<- keyword
"                     ^ punctuation.special
"                           ^ variable
  SELECT carrid FROM scarr.
"        ^ variable.member
"                    ^ type

FETCH NEXT CURSOR @dbcur INTO @row.
"<- keyword
"                 ^ punctuation.special
"                  ^ variable
"                             ^ punctuation.special
"                              ^ variable

FETCH NEXT CURSOR @dbcur
  APPENDING TABLE @rows PACKAGE SIZE @package_size.
"                 ^ punctuation.special
"                  ^ variable
"                                    ^ punctuation.special
"                                     ^ variable

CLOSE CURSOR @dbcur.
"<- keyword
"            ^ punctuation.special
"             ^ variable
