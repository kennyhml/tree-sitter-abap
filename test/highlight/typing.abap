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

TYPES create_root TYPE TABLE FOR CREATE demo_managed_root_was.
"     ^ type.definition
"                                       ^ type
TYPES create_path TYPE TABLE FOR CREATE demo_managed_root_was\\_Root\_child.
"     ^ type.definition
"                                       ^ type
"                                                              ^ type
"                                                                    ^ type
TYPES action_import TYPE TABLE FOR ACTION IMPORT demo_managed_root_was~copy.
"     ^ type.definition
"                                                ^ type
"                                                                      ^ function.method
TYPES action_result TYPE TABLE FOR ACTION RESULT /DMO/I_TRAVEL_M~acceptTravel.
"     ^ type.definition
"                                                ^ type
"                                                                ^ function.method
TYPES foo TYPE TABLE FOR INSTANCE AUTHORIZATION KEY bdef.
"     ^ type.definition
"                                                   ^ type
TYPES foo TYPE TABLE FOR AUTHORIZATION KEY bdef~group.
"     ^ type.definition
"                                          ^ type
"                                               ^ variable.member
TYPES bar TYPE TABLE FOR AUTHORIZATION RESULT bdef.
"     ^ type.definition
"                                             ^ type
TYPES bar TYPE TABLE FOR AUTHORIZATION RESULT bdef~group.
"     ^ type.definition
"                                             ^ type
"                                                  ^ variable.member

TYPES change_root TYPE TABLE FOR CHANGE demo_managed_root_was.
"     ^ type.definition
"                                       ^ type
TYPES update_root TYPE TABLE FOR UPDATE demo_managed_root_was.
"     ^ type.definition
"                                       ^ type
TYPES delete_root TYPE TABLE FOR DELETE demo_managed_root_was.
"     ^ type.definition
"                                       ^ type
TYPES r_chg TYPE TABLE FOR READ CHANGES demo_managed_root_was.
"     ^ type.definition
"                                       ^ type
TYPES r_impt TYPE TABLE FOR READ IMPORT demo_managed_root_was\_child.
"     ^ type.definition
"                                       ^ type
"                                                             ^ type
TYPES readlink TYPE TABLE FOR READ LINK demo_managed_root_was\_child.
"     ^ type.definition
"                                       ^ type
"                                                             ^ type
TYPES r_rslt TYPE TABLE FOR READ RESULT demo_managed_root_was\_child.
"     ^ type.definition
"                                       ^ type
"                                                             ^ type

TYPES determination TYPE TABLE FOR DETERMINATION
"     ^ type.definition
  demo_managed_root_was~set_status.
" ^ type
"                       ^ function.method
TYPES event TYPE TABLE FOR EVENT
"     ^ type.definition
  demo_managed_root_was~status_changed.
" ^ type
"                       ^ constant
TYPES failed TYPE TABLE FOR FAILED EARLY
"     ^ type.definition
  demo_managed_root_was.
" ^ type
TYPES hierarchy TYPE TABLE FOR HIERARCHY
"     ^ type.definition
  demo_managed_root_was.
" ^ type
TYPES features_key TYPE TABLE FOR INSTANCE FEATURES KEY
"     ^ type.definition
  demo_managed_root_was~control.
" ^ type
"                       ^ variable.member
TYPES features_result TYPE TABLE FOR FEATURES RESULT
"     ^ type.definition
  demo_managed_root_was.
" ^ type
TYPES function_import TYPE TABLE FOR FUNCTION IMPORT
"     ^ type.definition
  demo_managed_root_was~calculate.
" ^ type
"                       ^ function.method
TYPES function_result TYPE TABLE FOR FUNCTION RESULT
"     ^ type.definition
  demo_managed_root_was~calculate.
" ^ type
"                       ^ function.method
TYPES entity_key TYPE TABLE FOR KEY OF
"     ^ type.definition
  demo_managed_root_was.
" ^ type
TYPES mapped TYPE TABLE FOR MAPPED
"     ^ type.definition
  demo_managed_root_was.
" ^ type
TYPES permissions_key TYPE TABLE FOR PERMISSIONS KEY
"     ^ type.definition
  demo_managed_root_was.
" ^ type
TYPES reported TYPE TABLE FOR REPORTED LATE
"     ^ type.definition
  demo_managed_root_was.
" ^ type
TYPES validation TYPE TABLE FOR VALIDATION
"     ^ type.definition
  demo_managed_root_was~validate_status.
" ^ type
"                       ^ function.method

TYPES structure_create TYPE STRUCTURE FOR CREATE
"     ^ type.definition
  demo_managed_root_was.
" ^ type
TYPES structure_action_request TYPE STRUCTURE FOR ACTION REQUEST
"     ^ type.definition
  demo_managed_root_was~copy.
" ^ type
"                       ^ function.method
TYPES structure_authorization_request TYPE STRUCTURE FOR INSTANCE AUTHORIZATION REQUEST
"     ^ type.definition
  demo_managed_root_was~admin.
" ^ type
"                       ^ variable.member
TYPES structure_global_authorization_result TYPE STRUCTURE FOR GLOBAL AUTHORIZATION RESULT
"     ^ type.definition
  demo_managed_root_was~admin.
" ^ type
"                       ^ variable.member
TYPES structure_features_request TYPE STRUCTURE FOR INSTANCE FEATURES REQUEST
"     ^ type.definition
  demo_managed_root_was~control.
" ^ type
"                       ^ variable.member
TYPES structure_global_features_result TYPE STRUCTURE FOR GLOBAL FEATURES RESULT
"     ^ type.definition
  demo_managed_root_was~control.
" ^ type
"                       ^ variable.member
TYPES structure_function_request TYPE STRUCTURE FOR FUNCTION REQUEST
"     ^ type.definition
  demo_managed_root_was~calculate.
" ^ type
"                       ^ function.method
TYPES structure_permissions_request TYPE STRUCTURE FOR PERMISSIONS REQUEST
"     ^ type.definition
  demo_managed_root_was.
" ^ type
TYPES structure_permissions_result TYPE STRUCTURE FOR PERMISSIONS RESULT
"     ^ type.definition
  demo_managed_root_was.
" ^ type
TYPES structure_hierarchy TYPE STRUCTURE FOR HIERARCHY
"     ^ type.definition
  demo_managed_root_was.
" ^ type
TYPES structure_read_link TYPE STRUCTURE FOR READ LINK
"     ^ type.definition
  demo_managed_root_was\_child.
" ^ type
"                       ^ type

TYPES request_change TYPE REQUEST FOR CHANGE
"     ^ type.definition
  demo_managed_root_was.
" ^ type
TYPES request_delete TYPE REQUEST FOR DELETE
"     ^ type.definition
  /DMO/I_TRAVEL_M.
" ^ type
TYPES response_failed TYPE RESPONSE FOR FAILED
"     ^ type.definition
  demo_managed_root_was.
" ^ type
TYPES response_mapped_early TYPE RESPONSE FOR MAPPED EARLY
"     ^ type.definition
  demo_managed_root_was.
" ^ type
TYPES response_reported_late TYPE RESPONSE FOR REPORTED LATE
"     ^ type.definition
  demo_managed_root_was.
" ^ type
