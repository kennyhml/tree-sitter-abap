CLASS cl_demo_spfli DEFINITION 
"     ^ type
  PUBLIC 
" ^ keyword.modifier
  FINAL 
" ^ keyword.modifier
  CREATE PUBLIC
  INHERITING FROM cl_parent
"                 ^ type
  GLOBAL FRIENDS cl_parent
"                 ^ type
  ABSTRACT
" ^ keyword.modifier
  FOR BEHAVIOR OF demo_managed_additional_save.
"                 ^ type
  PUBLIC SECTION.
" ^ keyword.modifier
  PROTECTED SECTION.
" ^ keyword.modifier
  PRIVATE SECTION.
" ^ keyword.modifier
ENDCLASS.

CLASS c1 DEFINITION DEFERRED. 
"     ^ type
CLASS cl_demo_amdp_mesh DEFINITION
"     ^ type
  LOCAL FRIENDS cl_one cl_two cl_three.
"               ^ type
"                      ^ type
"                             ^ type
INTERFACE intf1. 
"         ^ type
interfaces zinf.
"          ^ type
ENDINTERFACE. 
INTERFACE intf2 DEFERRED. 
"         ^ type
 
CLASS demo DEFINITION ABSTRACT. 
"     ^ type
  PUBLIC SECTION. 
    INTERFACES intf 
"              ^ type
      ABSTRACT METHODS intf1~meth1 meth2
"                      ^ type
"                            ^ function.method
"                                  ^ function.method
      FINAL METHODS intf1~meth1 meth2
      ALL METHODS FINAL
"                 ^ keyword.modifier
      ALL METHODS ABSTRACT
"                 ^ keyword.modifier
      DATA VALUES attr1 = 'Hello' 
"                 ^ variable.member
      attr2 = 'World'. 
"     ^ variable.member
ENDCLASS. 
