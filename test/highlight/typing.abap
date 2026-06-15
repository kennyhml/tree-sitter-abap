types foo type p length 8 decimals 3.
"     ^ type
"              ^ type.builtin
types /bar/baz type spfli-carrid.
"     ^ type
"                   ^ type
"                         ^ variable.property
types __var type spfli-carrid-prop.
"     ^ type
"                ^ type
"                      ^ variable.property
"                             ^ variable.property
types num1 type cl_class=>some_type.
"     ^ type
"               ^ class
"                         ^ type
types foo type cl_class=>flight-seats.
"     ^ type
"                  ^ class
"                        ^ type
"                               ^ variable.property
types varchar(30) type c.
"     ^ type
"                      ^ type.builtin
types /foo/bar(30).
"     ^ type
types carriers TYPE RANGE OF crmt_object_id.
"     ^ type
"                            ^ type
types carriers TYPE RANGE OF spfli-carrid.
"     ^ type
"                            ^ type
"                                  ^ variable.property
types objects LIKE RANGE OF foo.
"     ^ type
"                           ^ variable
types objects LIKE RANGE OF foo->bar.
"     ^ type
"                           ^ variable
"                                ^ variable.property
types oref TYPE REF TO c1.
"     ^ type
"                      ^ type
types oref TYPE REF TO cl_http_response.
"     ^ type
"                       ^ class
types oref TYPE REF TO /www/cl_order.
"     ^ type
"                      ^ class
types oref TYPE REF TO if_message.
"     ^ type
"                      ^ interface
types oref TYPE REF TO /www/if_request_handler.
"     ^ type
"                      ^ interface
types oref TYPE REF TO zif_request_handler.
"     ^ type
"                      ^ interface
types oref TYPE REF TO lif_request_handler.
"     ^ type
"                      ^ interface
types oref LIKE REF TO object.
"     ^ type
"                      ^ variable
types gtyt_my_type type zclass=>cool_type_123.
"     ^ type
"                       ^ class
"                               ^ type
types tab_line type line of sflight.
"     ^ type
"                           ^ type
types tab_line type line of sflight-carrid.
"     ^ type
"                           ^ type
"                                   ^ variable.property
* -------------
* STRUCTURE TYPES
* -------------
TYPES: BEGIN OF street, name TYPE c LENGTH 41, no TYPE c LENGTH 4, END OF street. 
"               ^ type
"                       ^ variable.property
"                                 ^ type.builtin
"                                              ^ variable.property
"                                                      ^ type.builtin
"                                                               ^ number
"                                                                         ^ type
TYPES: BEGIN OF top, f1 TYPE mytype, BEGIN OF inner, f2 type i, END OF inner, END OF top. 
"               ^ type
"                    ^ variable.property
"                                             ^ variable.property
"                                                    ^ variable.property
"                                                                      ^ variable.property
"                                                                                    ^ type
types gtyt_std_tab1 type table of gtys_mystruct.
"     ^ type
"                                 ^ type
types gtyt_std_tab1 type standard table of gtys_mystruct with default key.
"     ^ type
"                                          ^ type
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
