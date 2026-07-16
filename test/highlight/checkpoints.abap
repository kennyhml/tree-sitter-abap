ASSERT ID demo_checkpoint_group 
"<- keyword.debug
"         ^ constant
          SUBKEY foo
"                ^ variable
          FIELDS 'Missing GUI'  sy-binpt 
"                 ^ string
"                               ^ variable.builtin
"                                  ^ variable.member
          CONDITION gui_flag = abap_true. 
"         ^ keyword
"                   ^ variable
"                              ^ constant.builtin
BREAK-POINT ID my_group foo.
"<- keyword.debug
"              ^ constant
"                       ^ variable
