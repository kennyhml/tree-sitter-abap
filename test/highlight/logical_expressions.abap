if execute = abap_true and not count is initial
"  ^ variable
"            ^ constant.builtin
"                      ^ keyword.operator
"                          ^ keyword.operator
"                              ^ variable
and lines( requested ) <> count.
"<- keyword.operator
"   ^ function.call
"          ^ variable
"                      ^ operator
"                         ^ variable

foo = boolc( sy-subrc is not initial ).
"     ^ function.call
"            ^ variable.builtin
"               ^ variable.member
"                     ^ keyword
"                        ^ keyword
"                            ^ keyword
