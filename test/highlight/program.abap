report ZMYTESTREPORT reduced functionality message-id /WWE/MSGCLASS
"      ^ module
"                                                     ^ type
defining database mydb no standard page heading
"                 ^ type
line-size 200 line-count 100(500).
"         ^ number
"                        ^ number
"                            ^ number
report ZMYTESTREPORT message-id /WWE/MSGCLASS.
"      ^ module
"                               ^ type
FUNCTION-POOL abap_docu message-id mid.
"             ^ module
"                                  ^ type
include zbaprog if found.
"       ^ module
start-of-selection.
"<- keyword
initialization.
"<- keyword
load-of-program.
"<- keyword

generate subroutine pool itab name prog
"<- keyword
"        ^ keyword
"                   ^ keyword
"                             ^ keyword
  message mess
" ^ keyword
  include incl
" ^ keyword
  line lin
" ^ keyword
  word wrd
" ^ keyword
  offset off
" ^ keyword
  message-id mid
" ^ keyword
  shortdump-id sid.
" ^ keyword

read report prog into source
"<- keyword
"    ^ keyword
"                ^ keyword
maximum width into width.
"<- keyword
"       ^ keyword
"             ^ keyword

insert report prog from source
"<- keyword
"      ^ keyword
"                  ^ keyword
maximum width into width
"<- keyword
"       ^ keyword
"             ^ keyword
program type pt
"<- keyword
"       ^ keyword
fixed-point arithmetic fp
"<- keyword
"           ^ keyword
version vs.
"<- keyword

insert report prog from source keeping directory entry.
"<- keyword
"      ^ keyword
"                  ^ keyword
"                              ^ keyword
"                                      ^ keyword
"                                                ^ keyword

insert report prog from source directory entry dir.
"<- keyword
"      ^ keyword
"                  ^ keyword
"                              ^ keyword
"                                        ^ keyword

syntax-check for source message mess line lin word wrd
"<- keyword
"            ^ keyword
"                       ^ keyword
"                                    ^ keyword
"                                             ^ keyword
program template
"<- keyword
directory entry dir
"<- keyword
"         ^ keyword
with current switchstates
"<- keyword
"    ^ keyword
"            ^ keyword
include incl
"<- keyword
offset off
"<- keyword
message-id mid.
"<- keyword
