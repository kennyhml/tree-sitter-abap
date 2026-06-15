types my_type type p length 8 decimals 3.
" <- keyword
"      ^ type
"              ^ keyword
"                  ^ type.builtin
"                     ^ keyword
"                           ^ number
"                              ^ keyword
"                                      ^ number
"                                       ^ delimiter
types my_type type spfli-carrid.
" <- keyword
"      ^ type
"              ^ keyword
"                  ^ type
"                       ^ operator
"                           ^ variable.property
"                              ^ delimiter
types my_type type spfli-carrid-prop.
"     ^ type
"                  ^ type
"                       ^ operator
"                        ^ variable.property
"                              ^ operator
"                               ^ variable.property
types my_type type cl_class=>carrid-pop.
" <- keyword
"                  ^ class
"                          ^ operator
"                            ^ type
"                                  ^ operator
"                                   ^ variable.property
types my_type(30) type c.
" <- keyword
"      ^ type
"            ^ delimiter
"             ^ number
"               ^ delimiter
"                  ^ keyword
"                      ^ type.builtin
"                       ^ delimiter
types my_type(30).
" <- keyword
"      ^ type
"            ^ delimiter
"             ^ number
"               ^ delimiter
"                ^ delimiter
types my_type(30).
" <- keyword
"      ^ type
"            ^ delimiter
"             ^ number
"               ^ delimiter
"                ^ delimiter

* -------------
* RANGE TYPES
* -------------
types carrid_range TYPE RANGE OF i.
" <- keyword
"      ^ type
"                   ^ keyword
"                        ^ keyword
"                             ^ keyword
"                                ^ type
"                                 ^ delimiter
types carrid_range TYPE RANGE OF spfli-carrid.
" <- keyword
"      ^ type
"                  ^ keyword
"                       ^ keyword
"                             ^ keyword
"                                ^ type
"                                     ^ operator
"                                       ^ variable.property
"                                            ^ delimiter
types carrid_range LIKE RANGE OF foo->bar.
" <- keyword
"     ^ type
"                  ^ keyword
"                       ^ keyword
"                             ^ keyword
"                                ^ variable
"                                   ^ operator
"                                     ^ variable.property
"                                        ^ delimiter
* -------------
* REFERENCE TYPES
* -------------
types oref TYPE REF TO c1.
" <- keyword
"     ^ type
"          ^ keyword
"               ^ keyword
"                   ^ keyword
"                      ^ type
"                        ^ delimiter
types oref TYPE REF TO cl_http_response.
" <- keyword
"     ^ type
"          ^ keyword
"               ^ keyword
"                   ^ keyword
"                       ^ class
"                                      ^ delimiter
types oref TYPE REF TO /www/cl_order.
" <- keyword
"     ^ type
"          ^ keyword
"               ^ keyword
"                   ^ keyword
"                       ^ class
"                                   ^ delimiter
types oref TYPE REF TO if_message.
" <- keyword
"     ^ type
"          ^ keyword
"               ^ keyword
"                   ^ keyword
"                      ^ interface
"                                ^ delimiter
types oref TYPE REF TO /www/if_request_handler.
" <- keyword
"     ^ type
"          ^ keyword
"               ^ keyword
"                   ^ keyword
"                       ^ interface
"                                             ^ delimiter
types oref TYPE REF TO zif_request_handler.
" <- keyword
"     ^ type
"          ^ keyword
"               ^ keyword
"                   ^ keyword
"                       ^ interface
"                                         ^ delimiter
types oref TYPE REF TO lif_request_handler.
" <- keyword
"      ^ type
"           ^ keyword
"               ^ keyword
"                   ^ keyword
"                       ^ interface
"                                         ^ delimiter
types oref LIKE REF TO object.
" <- keyword
"     ^ type
"          ^ keyword
"               ^ keyword
"                   ^ keyword
"                      ^ variable
"                            ^ delimiter
* -------------
* REFERRED TYPES
* -------------
types gtyt_my_type type zclass=>cool_type_123.
" <- keyword
"     ^ type
"                  ^ keyword
"                       ^ class
"                             ^ operator
"                               ^ type
"                                            ^ delimiter
types tab_line type line of sflight.
" <- keyword
"     ^ type
"              ^ keyword
"                   ^ keyword
"                        ^ keyword
"                           ^ type
"                                  ^ delimiter
* -------------
* STRUCTURE TYPES
* -------------
TYPES: BEGIN OF street, name TYPE c LENGTH 41, no TYPE c LENGTH 4, END OF street. 
" <- keyword
"                 ^ type
"                       ^ variable.property
"                                 ^ type.builtin
"                                          ^ number
"                                              ^ variable.property
"                                                      ^ type.builtin
"                                                               ^ number
"                                                                           ^ type
TYPES: BEGIN OF top, f1 TYPE mytype, BEGIN OF inner, f2 type i, END OF inner, END OF top. 
" <- keyword
"               ^ type
"                    ^ variable.property
"                                             ^ variable.property
"                                                    ^ variable.property
"                                                                      ^ variable.property
"                                                                                    ^ type
* -------------
* TABLE TYPES
* -------------
types gtyt_std_tab1 type table of gtys_mystruct.
" <- keyword
"     ^ type
"                   ^ keyword
"                        ^ keyword
"                              ^ keyword
"                                 ^ type
types gtyt_std_tab1 type standard table of gtys_mystruct with default key.
" <- keyword
"     ^ type
"                   ^ keyword
"                        ^ keyword
"                                 ^ keyword
"                                       ^ keyword
"                                          ^ type
"                                                        ^ keyword
"                                                             ^ keyword
types: gtyt_ref_table type standard table of ref to cl_my_class.
"      ^ type
"                                                   ^ class
types gtyt_std_tab4 type standard table of gtys_mystruct with non-unique key var1 var2.
"     ^ type                               
"                                          ^ type                            
"                                                                            ^ variable.property
"                                                                                 ^ variable.property
types gtyt_std_tab1 type standard table of gtys_mystruct with empty key.
"     ^ type                               
"                                          ^ type                            
types gtyt_std_tab5 type standard table of gtys_mystruct with key primary_key components table_line.
"     ^ type                               
"                                          ^ type                            
"                                                                 ^ variable.key
"                                                                                        ^ variable.property
types bar type table of foo with non-unique key primary_key components f1 with unique hashed key k2 components f2.
"     ^ type                               
"                       ^ type                            
"                                               ^ variable.key
"                                                                      ^ variable.property
"                                                                                                ^ variable.key
"                                                                                                              ^ variable.property
types gtyt_tab type index table. " TODO: Is a generic 'index table' a type?
"     ^ type
