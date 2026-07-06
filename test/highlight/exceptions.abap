RAISE not_found.
"<- keyword.exception
"     ^ variable.parameter
TRY. 
"<- keyword.exception
    TRY. 
"   ^ keyword.exception
        RAISE EXCEPTION TYPE cx_demo. 
"       ^ keyword.exception
"             ^ keyword.exception
"                            ^ type
      CATCH cx_demo INTO FINAL(exc). 
"     ^ keyword.exception
"           ^ type
"                              ^ variable
        RAISE EXCEPTION exc. 
"       ^ keyword.exception
"             ^ keyword.exception
"                       ^ variable
    ENDTRY. 
"   ^ keyword.exception
  CATCH cx_demo. 
" ^ keyword.exception
"       ^ type
ENDTRY. 
"<- keyword.exception
RAISE RESUMABLE EXCEPTION TYPE cx_demo. 
"<- keyword.exception
"     ^ keyword.exception
"               ^ keyword.exception
"                              ^ type
RAISE EXCEPTION TYPE cx_sy_dynamic_osql_semantics 
"                    ^ type
  EXPORTING 
    textid = cx_sy_dynamic_osql_semantics=>unknown_table_name 
"   ^ variable.parameter
"            ^ type
"                                          ^ variable.member
    token  = 'Test'. 
"   ^ variable.parameter
RAISE EXCEPTION TYPE cx_dyn_t100 MESSAGE e104(sabapdemos) WITH 'I' 'am' 'an' 'Exception!'.
"                    ^ type
"                                        ^ constant.builtin
"                                         ^ number
"                                             ^ variable
