CLASS-METHODS scalar_function
"<- keyword.function
"             ^ function.method
  FOR SCALAR FUNCTION cds_scalar_func.
" ^ keyword
"     ^ keyword
"            ^ keyword
"                     ^ type

CLASS-METHODS table_function
"<- keyword.function
"             ^ function.method
  FOR TABLE FUNCTION cds_table_func.
" ^ keyword
"     ^ keyword
"           ^ keyword
"                     ^ type

CLASS-METHODS sql_service
"<- keyword.function
"             ^ function.method
  FOR SQL SERVICE
" ^ keyword
"     ^ keyword
"         ^ keyword
  AMDP OPTIONS READ-ONLY CLIENT INDEPENDENT.
" ^ keyword
"      ^ keyword
"              ^ keyword
"                        ^ keyword
"                               ^ keyword

CLASS-METHODS session_client
"<- keyword.function
"             ^ function.method
  AMDP OPTIONS CDS SESSION CLIENT CURRENT.
" ^ keyword
"      ^ keyword
"              ^ keyword
"                  ^ keyword
"                          ^ keyword
"                                 ^ keyword

CLASS-METHODS ddl_object
"<- keyword.function
"             ^ function.method
  FOR DDL OBJECT.
" ^ keyword
"     ^ keyword
"         ^ keyword

CLASS-METHODS ddl_dependent
"<- keyword.function
"             ^ function.method
  FOR DDL OBJECT
" ^ keyword
"     ^ keyword
"         ^ keyword
  OPTIONS CDS SESSION CLIENT DEPENDENT.
" ^ keyword
"         ^ keyword
"             ^ keyword
"                     ^ keyword
"                            ^ keyword

CLASS-METHODS ddl_required
"<- keyword.function
"             ^ function.method
  FOR DDL OBJECT
" ^ keyword
"     ^ keyword
"         ^ keyword
  OPTIONS CDS SESSION CLIENT REQUIRED.
" ^ keyword
"         ^ keyword
"             ^ keyword
"                     ^ keyword
"                            ^ keyword

CLASS-METHODS ddl_independent
"<- keyword.function
"             ^ function.method
  FOR DDL OBJECT
" ^ keyword
"     ^ keyword
"         ^ keyword
  OPTIONS CLIENT INDEPENDENT.
" ^ keyword
"         ^ keyword
"                ^ keyword

METHOD database_procedure
"<- keyword
"      ^ function.method
  BY DATABASE PROCEDURE
" ^ keyword
"    ^ keyword
"             ^ keyword
  FOR HDB
" ^ keyword
"     ^ constant.builtin
  LANGUAGE SQLSCRIPT
" ^ keyword
"          ^ constant.builtin
  OPTIONS READ-ONLY SUPPRESS SYNTAX ERRORS
" ^ keyword
"         ^ keyword
"                   ^ keyword
"                            ^ keyword
"                                   ^ keyword
  USING scarr spfli cl_other_amdp=>meth.
" ^ keyword
"       ^ type
"             ^ type
"                   ^ type
"                                  ^ function.method
ENDMETHOD.
"<- keyword

METHOD database_function
"<- keyword
"      ^ function.method
  BY DATABASE FUNCTION
" ^ keyword
"    ^ keyword
"             ^ keyword
  FOR HDB
" ^ keyword
"     ^ constant.builtin
  LANGUAGE SQLSCRIPT
" ^ keyword
"          ^ constant.builtin
  OPTIONS READ-ONLY DETERMINISTIC.
" ^ keyword
"         ^ keyword
"                   ^ keyword
ENDMETHOD.
"<- keyword

METHOD graph_workspace_impl
"<- keyword
"      ^ function.method
  BY DATABASE GRAPH WORKSPACE
" ^ keyword
"    ^ keyword
"             ^ keyword
"                   ^ keyword
  FOR HDB
" ^ keyword
"     ^ constant.builtin
  LANGUAGE SQL
" ^ keyword
"          ^ constant.builtin
  USING z_graph_workspace cl_clas=>mymethod.
" ^ keyword
"       ^ type
"                         ^ type
"                                  ^ function.method
ENDMETHOD.
"<- keyword

METHOD external_schema
"<- keyword
"      ^ function.method
  BY DATABASE PROCEDURE
" ^ keyword
"    ^ keyword
"             ^ keyword
  FOR HDB
" ^ keyword
"     ^ constant.builtin
  LANGUAGE SQLSCRIPT
" ^ keyword
"          ^ constant.builtin
  OPTIONS READ-ONLY
" ^ keyword
"         ^ keyword
  USING SCHEMA ext_schema OBJECTS ext_table ext_view
" ^ keyword
"       ^ keyword
"              ^ type
"                         ^ keyword
"                                 ^ type
"                                           ^ type
  USING SCHEMA archive_schema OBJECTS old_table.
" ^ keyword
"       ^ keyword
"                             ^ keyword
ENDMETHOD.
"<- keyword
