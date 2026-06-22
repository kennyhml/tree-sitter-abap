types foo type p length 8 decimals 3.
"     ^ type
"              ^ type.builtin
types /bar/baz type spfli-carrid.
"     ^ type
"                   ^ type
"                         ^ variable.member
types __var type spfli-carrid-prop.
"     ^ type
"                ^ type
"                      ^ variable.member
"                             ^ variable.member
types num1 type cl_class=>some_type.
"     ^ type
"               ^ type
"                         ^ type
types foo type cl_class=>flight-seats.
"     ^ type
"                  ^ type
"                        ^ type
"                               ^ variable.member
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
"                                  ^ variable.member
types objects LIKE RANGE OF foo.
"     ^ type
"                           ^ variable
types objects LIKE RANGE OF foo->bar.
"     ^ type
"                           ^ variable
"                                ^ variable.member
types oref TYPE REF TO c1.
"     ^ type
"                      ^ type
types oref TYPE REF TO cl_http_response.
"     ^ type
"                       ^ type
types oref TYPE REF TO /www/cl_order.
"     ^ type
"                      ^ type
types oref TYPE REF TO if_message.
"     ^ type
"                      ^ type
types oref TYPE REF TO /www/if_request_handler.
"     ^ type
"                      ^ type
types oref TYPE REF TO zif_request_handler.
"     ^ type
"                      ^ type
types oref TYPE REF TO lif_request_handler.
"     ^ type
"                      ^ type
types oref LIKE REF TO object.
"     ^ type
"                      ^ variable
types gtyt_my_type type zclass=>cool_type_123.
"     ^ type
"                       ^ type
"                               ^ type
types tab_line type line of sflight.
"     ^ type
"                           ^ type
types tab_line type line of sflight-carrid.
"     ^ type
"                           ^ type
"                                   ^ variable.member
TYPES: BEGIN OF street, name TYPE c LENGTH 41, no TYPE c LENGTH 4, END OF street. 
"               ^ type
"                       ^ variable.member
"                                 ^ type.builtin
"                                              ^ variable.member
"                                                      ^ type.builtin
"                                                               ^ number
"                                                                         ^ type
TYPES: BEGIN OF top, f1 TYPE mytype, BEGIN OF inner, f2 type i, END OF inner, END OF top. 
"               ^ type
"                    ^ variable.member
"                                             ^ variable.member
"                                                    ^ variable.member
"                                                                      ^ variable.member
"                                                                                    ^ type
types gtyt_std_tab1 type table of gtys_mystruct.
"     ^ type
"                                 ^ type
types gtyt_std_tab1 type standard table of gtys_mystruct with default key.
"     ^ type
"                                          ^ type
types: gtyt_ref_table type standard table of ref to cl_my_class.
"      ^ type
"                                                   ^ type
types gtyt_std_tab4 type standard table of gtys_mystruct with non-unique key var1 var2.
"     ^ type                               
"                                          ^ type                            
"                                                                            ^ variable.member
"                                                                                 ^ variable.member
types gtyt_std_tab1 type standard table of gtys_mystruct with empty key.
"     ^ type                               
"                                          ^ type                            
types gtyt_std_tab5 type standard table of gtys_mystruct with key primary_key components table_line.
"     ^ type                               
"                                          ^ type                            
"                                                                 ^ variable.key
"                                                                                        ^ variable.member
types bar type table of foo with non-unique key primary_key components f1 with unique hashed key k2 components f2.
"     ^ type                               
"                       ^ type                            
"                                               ^ variable.key
"                                                                      ^ variable.member
"                                                                                                ^ variable.key
types foo type any.
"     ^ type
"              ^ type.builtin
types foo type index table.
"     ^ type
"              ^ type.builtin
"                    ^ type.builtin
types foo type any table.
"     ^ type
"              ^ type.builtin
"                  ^ type.builtin
types foo type hashed table.
"     ^ type
"              ^ type.builtin
"                     ^ type.builtin
types foo type sorted table.
"     ^ type
"              ^ type.builtin
"                     ^ type.builtin
types foo type table.
"     ^ type
"              ^ type.builtin
types foo type standard table.
"     ^ type
"              ^ type.builtin
"                       ^ type.builtin
