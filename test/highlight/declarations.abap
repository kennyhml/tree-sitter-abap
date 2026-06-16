data foo type bar value 'baz'.
"<- keyword
"    ^ variable
"             ^ type
data(inline) = 'baz'
"    ^ variable
final(immutable) = 123.
"     ^ variable
constants myconst type i value 777.
"<- keyword
"         ^ variable
"                      ^ type.builtin
constants myconst type i value is initial.
"         ^ variable
"                      ^ type.builtin
"                                 ^ keyword
field-symbols <symbol> type x read-only.
"<- keyword
"              ^ variable
"                            ^ type.builtin
"                              ^ keyword
loop at itab assigning field-symbol(<inline>). endloop.
"                                    ^ variable
DATA: one TYPE abap_bool VALUE abap_true, two TYPE abap_bool VALUE abap_false.
"     ^ variable
"              ^ type
"                              ^ variable
"                                         ^ variable
"                                                  ^ type
"                                                                  ^ variable
DATA: BEGIN OF s1, c1 TYPE c VALUE '1', c2 TYPE c VALUE '2', END OF s1.
"              ^ variable
"                  ^ variable.property
"                                       ^ variable.property
"                                         ^ variable
"                                                                   ^ variable

