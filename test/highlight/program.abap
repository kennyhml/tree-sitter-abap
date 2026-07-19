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
"                        ^ variable
"                             ^ keyword
"                                  ^ variable
  message mess
" ^ keyword
"         ^ variable
  include incl
" ^ keyword
"         ^ variable
  line lin
" ^ keyword
"      ^ variable
  word wrd
" ^ keyword
"      ^ variable
  offset off
" ^ keyword
"        ^ variable
  message-id mid
" ^ keyword
"            ^ variable
  shortdump-id sid.
" ^ keyword
"              ^ variable

read report prog into source
"<- keyword
"    ^ keyword
"           ^ variable
"                ^ keyword
"                     ^ variable
maximum width into width.
"<- keyword
"       ^ keyword
"             ^ keyword
"                  ^ variable

insert report prog from source
"<- keyword
"      ^ keyword
"             ^ variable
"                  ^ keyword
"                       ^ variable
maximum width into width
"<- keyword
"       ^ keyword
"             ^ keyword
"                  ^ variable
program type pt
"<- keyword
"       ^ keyword
"            ^ variable
fixed-point arithmetic fp
"<- keyword
"           ^ keyword
"                      ^ variable
version vs.
"<- keyword
"       ^ variable

insert report prog from source keeping directory entry.
"<- keyword
"      ^ keyword
"             ^ variable
"                  ^ keyword
"                       ^ variable
"                              ^ keyword
"                                      ^ keyword
"                                                ^ keyword

insert report prog from source directory entry dir.
"<- keyword
"      ^ keyword
"             ^ variable
"                  ^ keyword
"                       ^ variable
"                              ^ keyword
"                                        ^ keyword
"                                              ^ variable

syntax-check for source message mess line lin word wrd
"<- keyword
"            ^ keyword
"                ^ variable
"                       ^ keyword
"                               ^ variable
"                                    ^ keyword
"                                         ^ variable
"                                             ^ keyword
"                                                  ^ variable
program template
"<- keyword
"       ^ variable
directory entry dir
"<- keyword
"         ^ keyword
"               ^ variable
with current switchstates
"<- keyword
"    ^ keyword
"            ^ keyword
include incl
"<- keyword
"       ^ variable
offset off
"<- keyword
"      ^ variable
message-id mid.
"<- keyword
"          ^ variable

read textpool prog into texts language lang.
"<- keyword
"    ^ keyword
"             ^ variable
"                  ^ keyword
"                       ^ variable
"                             ^ keyword
"                                      ^ variable

insert textpool prog from texts language lang.
"<- keyword
"      ^ keyword
"               ^ variable
"                    ^ keyword
"                         ^ variable
"                               ^ keyword
"                                        ^ variable
