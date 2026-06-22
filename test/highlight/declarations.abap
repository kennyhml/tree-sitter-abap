data foo type bar value 'baz'.
"<- keyword
"    ^ variable
"             ^ type
data(inline) = 'baz'
"    ^ variable
final(immutable) = 123.
"     ^ variable
constants myconst type abap_bool value abap_undefined.
"<- keyword
"         ^ constant
"                      ^ type
"                                      ^ constant.builtin
constants myconst type i value is initial.
"         ^ constant
"                      ^ type.builtin
"                                 ^ keyword
field-symbols <symbol> type x read-only.
"<- keyword
"              ^ variable
"                           ^ type.builtin
"                              ^ keyword
loop at itab assigning field-symbol(<inline>). endloop.
"                                    ^ variable
DATA: one TYPE abap_bool VALUE abap_true, two TYPE abap_bool VALUE abap_false.
"     ^ variable
"              ^ type
"                              ^ constant.builtin
"                                         ^ variable
"                                                  ^ type
"                                                                  ^ constant.builtin
DATA: BEGIN OF s1, c1 TYPE c VALUE '1', c2 TYPE c VALUE '2', END OF s1.
"              ^ variable
"                          ^ type.builtin
"                                               ^ type.builtin
"                  ^ variable.member
"                                       ^ variable.member
"                                                                   ^ variable
DATA: BEGIN OF s1, c1 TYPE c, begin of s2, c2 TYPE c, end of s2, END OF s1.
"              ^ variable
"                  ^ variable.member
"                                      ^ variable.member
"                                          ^ variable.member
"                                                            ^ variable.member
"                                                                       ^ variable
CONSTANTS: BEGIN OF s1, c1 TYPE c, begin of s2, c2 TYPE c, end of s2, END OF s1.
"                   ^ constant
"                       ^ variable.member
"                                           ^ variable.member
"                                               ^ variable.member
"                                                                 ^ variable.member
"                                                                            ^ constant
