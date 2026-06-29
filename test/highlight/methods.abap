METHODS meth 
"<- keyword.function
"       ^ function.method
  IMPORTING 
    p1 TYPE i
"   ^ variable.parameter
"           ^ type.builtin
    value(p2) type foo optional
"   ^ keyword.modifier
"         ^ variable.parameter
"                      ^ keyword.modifier
    reference(p3) TYPE spfli
"   ^ keyword.modifier
"             ^ variable.parameter
  EXPORTING
    e1 type string
"   ^ variable.parameter
  EXCEPTIONS
    not_found sys_error
"   ^ variable.parameter
"             ^ variable.parameter
  RAISING
    resumable(not_found) 
"   ^ keyword.modifier
"             ^ type
    sys_error
"   ^ type
  RETURNING
    value(result) type xstring.
"   ^ keyword.modifier
"         ^ variable.parameter
"                      ^ type.builtin

methods constructor.
"<- keyword.function
"       ^ constructor

class-methods class_constructor.
"<- keyword.function
"             ^ constructor


method test.
"      ^ function.method

endmethod.

method if_oo_adt_classrun~main.
"      ^ type
"                         ^ function.method
endmethod.

method constructor.
"      ^ constructor
  super->constructor( ).
"        ^ constructor

endmethod.

method class_constructor.
"      ^ constructor

endmethod.
