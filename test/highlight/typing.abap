types foo type p length 8 decimals 3.
"     ^ type.definition
"              ^ type.builtin
types /bar/baz type spfli-carrid.
"     ^ type.definition
"                   ^ type
"                         ^ variable.member
types __var type spfli-carrid-prop.
"     ^ type.definition
"                ^ type
"                      ^ variable.member
"                             ^ variable.member
types num1 type cl_class=>some_type.
"     ^ type.definition
"               ^ type
"                         ^ type
types foo type cl_class=>flight-seats.
"     ^ type.definition
"                  ^ type
"                        ^ type
"                               ^ variable.member
types varchar(30) type c.
"     ^ type.definition
"                      ^ type.builtin
types /foo/bar(30).
"     ^ type.definition
types carriers TYPE RANGE OF crmt_object_id.
"     ^ type.definition
"                            ^ type
types carriers TYPE RANGE OF spfli-carrid.
"     ^ type.definition
"                            ^ type
"                                  ^ variable.member
types objects LIKE RANGE OF foo.
"     ^ type.definition
"                           ^ variable
types objects LIKE RANGE OF foo->bar.
"     ^ type.definition
"                           ^ variable
"                                ^ variable.member
types oref TYPE REF TO c1.
"     ^ type.definition
"                      ^ type
types oref TYPE REF TO cl_http_response.
"     ^ type.definition
"                       ^ type
types oref TYPE REF TO /www/cl_order.
"     ^ type.definition
"                      ^ type
types oref TYPE REF TO if_message.
"     ^ type.definition
"                      ^ type
types oref TYPE REF TO /www/if_request_handler.
"     ^ type.definition
"                      ^ type
types oref TYPE REF TO zif_request_handler.
"     ^ type.definition
"                      ^ type
types oref TYPE REF TO lif_request_handler.
"     ^ type.definition
"                      ^ type
types oref LIKE REF TO object.
"     ^ type.definition
"                      ^ variable
types gtyt_my_type type zclass=>cool_type_123.
"     ^ type.definition
"                       ^ type
"                               ^ type
types tab_line type line of sflight.
"     ^ type.definition
"                           ^ type
types tab_line type line of sflight-carrid.
"     ^ type.definition
"                           ^ type
"                                   ^ variable.member
TYPES: BEGIN OF street, name TYPE c LENGTH 41, no TYPE c LENGTH 4, END OF street. 
"               ^ type.definition
"                       ^ variable.member
"                                 ^ type.builtin
"                                              ^ variable.member
"                                                      ^ type.builtin
"                                                               ^ number
"                                                                         ^ type.definition
TYPES: BEGIN OF top, f1 TYPE mytype, BEGIN OF inner, f2 type i, END OF inner, END OF top. 
"               ^ type.definition
"                    ^ variable.member
"                                             ^ variable.member
"                                                    ^ variable.member
"                                                                      ^ variable.member
"                                                                                    ^ type.definition
types gtyt_std_tab1 type table of gtys_mystruct.
"     ^ type.definition
"                                 ^ type
types gtyt_std_tab1 type standard table of gtys_mystruct with default key.
"     ^ type.definition
"                                          ^ type
types: gtyt_ref_table type standard table of ref to cl_my_class.
"      ^ type.definition
"                                                   ^ type
types gtyt_std_tab4 type standard table of gtys_mystruct with non-unique key var1 var2.
"     ^ type.definition
"                                          ^ type                            
"                                                                            ^ variable.member
"                                                                                 ^ variable.member
types gtyt_std_tab1 type standard table of gtys_mystruct with empty key.
"     ^ type.definition
"                                          ^ type                            
types gtyt_std_tab5 type standard table of gtys_mystruct with key primary_key components table_line.
"     ^ type.definition
"                                          ^ type                            
"                                                                 ^ constant
"                                                                                        ^ variable.member
types bar type table of foo with non-unique key primary_key components f1 with unique hashed key k2 components f2.
"     ^ type.definition
"                       ^ type                            
"                                               ^ constant
"                                                                      ^ variable.member
"                                                                                                ^ constant
types bar type table of foo with non-unique key primary_key alias pk components f1.
"     ^ type.definition
"                       ^ type                            
"                                               ^ constant
"                                                                 ^ constant
TYPES: BEGIN OF st_h,
"               ^ type.definition
         a TYPE i,
       END OF st_h,
"             ^ type.definition
       ty_tab_f TYPE string.
"      ^ type.definition
"                    ^ type.builtin
types foo type any.
"     ^ type.definition
"              ^ type.builtin
types foo type index table.
"     ^ type.definition
"              ^ type.builtin
"                    ^ type.builtin
types foo type any table.
"     ^ type.definition
"              ^ type.builtin
"                  ^ type.builtin
types foo type hashed table.
"     ^ type.definition
"              ^ type.builtin
"                     ^ type.builtin
types foo type sorted table.
"     ^ type.definition
"              ^ type.builtin
"                     ^ type.builtin
types foo type table.
"     ^ type.definition
"              ^ type.builtin
types foo type standard table.
"     ^ type.definition
"              ^ type.builtin
"                       ^ type.builtin

TYPES: 
  BEGIN OF ENUM planet, 
"               ^ type.definition
    mercury, 
"   ^ constant
    venus, 
"   ^ constant
    earth, 
"   ^ constant
    mars, 
"   ^ constant
  END OF ENUM planet.
"             ^ type.definition

TYPES: 
  BEGIN OF ENUM bool STRUCTURE b BASE TYPE abap_boolean,
"               ^ type.definition
"                              ^ constant
"                                          ^ type
    false VALUE IS INITIAL, 
"   ^ constant
    true  VALUE abap_true, 
"               ^ constant.builtin
  END OF ENUM bool STRUCTURE b. 
"                            ^ constant

TYPES BEGIN OF ENUM planet.
"                   ^ type.definition
TYPES foo.
"     ^ constant
TYPES bar.
"     ^ constant
TYPES END OF ENUM planet.
"                 ^ type.definition
