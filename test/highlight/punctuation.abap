foo.
"  ^ punctuation.delimiter
data: foo, bar.
"   ^ punctuation.delimiter
"        ^ punctuation.delimiter
"             ^ punctuation.delimiter
data(foo).
"   ^ punctuation.bracket
"       ^ punctuation.bracket
foo( ).
"  ^ punctuation.bracket
"    ^ punctuation.bracket
(foo).
"<- punctuation.bracket
"   ^ punctuation.bracket
tab[ 1 ].
"  ^ punctuation.bracket
"      ^ punctuation.bracket
tab[].
"  ^ punctuation.bracket
|ABAP is so { fun_or_not_fun } to parse|.
"           ^ punctuation.special
"                            ^ punctuation.special
