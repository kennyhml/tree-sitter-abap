p1 BIT-AND p2 BIT-AND p3
"<- variable
"  ^ keyword.operator
"          ^ variable
"             ^ keyword.operator
"                     ^ variable
p1 BIT-OR p2
"<- variable
"  ^ keyword.operator
"         ^ variable
p1 BIT-XOR p2
"<- variable
"  ^ keyword.operator
"          ^ variable
BIT-NOT ( p1 BIT-OR p2 )
"<- keyword.operator
"         ^ variable
"                   ^ variable
o
