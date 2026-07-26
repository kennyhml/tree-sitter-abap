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
