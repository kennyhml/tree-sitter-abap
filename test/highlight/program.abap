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
