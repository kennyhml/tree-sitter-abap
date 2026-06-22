if foo = abap_true.
"<- keyword.conditional
elseif foo = abab_false.
"<- keyword.conditional
else.
"<- keyword.conditional
endif.

"<- keyword.conditional
case foo.
"<- keyword.conditional
when baz.
"<- keyword.conditional
when others.
"<- keyword.conditional
"    ^ keyword.conditional
endcase.
"<- keyword.conditional

"<- keyword.conditional
case type of foo.
"<- keyword.conditional
when type cl_tranport.
"<- keyword.conditional
"    ^ keyword.conditional
when others.
"<- keyword.conditional
"    ^ keyword.conditional
endcase.
"<- keyword.conditional
if a eq b or c ne d.
"    ^ keyword.operator
"         ^ keyword.operator
"              ^ keyword.operator
elseif e gt f and g lt h.
"        ^ keyword.operator
"             ^ keyword.operator
"                   ^ keyword.operator
elseif i ge j or k le l.
"        ^ keyword.operator
"                  ^ keyword.operator
elseif s1 co s2 and s3 cn s4.
"         ^ keyword.operator
"                      ^ keyword.operator
elseif s1 ca s2 or s3 na s4.
"         ^ keyword.operator
"                     ^ keyword.operator
elseif s1 cs s2 and s3 ns s4.
"         ^ keyword.operator
"                      ^ keyword.operator
elseif s1 cp s2 or s3 np s4.
"         ^ keyword.operator
"                     ^ keyword.operator
elseif h1 byte-co h2 or h3 byte-cn h4.
"         ^ keyword.operator
"                           ^ keyword.operator
elseif h1 byte-ca h2 and h3 byte-na h4.
"         ^ keyword.operator
"                           ^ keyword.operator
elseif h1 byte-cs h2 or h3 byte-ns h4.
"         ^ keyword.operator
"                           ^ keyword.operator
elseif f1 o m1 and f1 z m1 or f1 m m1.
"         ^ keyword.operator
"                     ^ keyword.operator
"                                ^ keyword.operator
endif.
