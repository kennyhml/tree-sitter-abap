AT SELECTION-SCREEN ON p_carrid. 
"                      ^ variable.parameter
AT SELECTION-SCREEN ON END OF p_carrid. 
"                             ^ variable.parameter
AT SELECTION-SCREEN ON BLOCK block.
"                            ^ constant
AT SELECTION-SCREEN ON RADIOBUTTON GROUP grp.
"                                        ^ constant
AT SELECTION-SCREEN ON HELP-REQUEST FOR p_carr_2.
"                                       ^ variable.parameter
AT SELECTION-SCREEN ON VALUE-REQUEST FOR p_carr_2.
"                                        ^ variable.parameter
PARAMETERS p_carrid TYPE carrid obligatory.
"          ^ variable.parameter
"                        ^ type
parameters p_impsip as checkbox default abap_true modif id imp.
"          ^ variable.parameter
"                                                          ^ constant
PARAMETERS p_carrid TYPE spfli-carrid USER-COMMAND onli  DEFAULT 'LH'. 
"          ^ variable.parameter
"                        ^ type
"                              ^ variable.member
"                                                  ^ constant
parameters:	p_queue radiobutton group r1 default 'X', 
"           ^ variable.parameter
"                                     ^ constant
            p_seq radiobutton group r1.
"           ^ variable.parameter
"                                   ^ constant
PARAMETERS p_cust  TYPE kunnr MATCHCODE OBJECT debi.
"          ^ variable.parameter
"                                              ^ type
SELECT-OPTIONS s_carrid FOR gv_carrid.
"              ^ variable.parameter
"                           ^ variable
SELECT-OPTIONS s_vbeln FOR vbak-vbeln.
"              ^ variable.parameter
"                           ^ variable
"                               ^ variable.member
SELECT-OPTIONS s_date FOR gv_date default gv_value.
"              ^ variable.parameter
"                         ^ variable
"                                         ^ constant
SELECT-OPTIONS s_vbeln FOR gv_vbeln DEFAULT '1000' TO '2000' OPTION BT SIGN I.
"              ^ variable.parameter
"                          ^ variable
"                                           ^ string
"                                                     ^ string
SELECT-OPTIONS s_matnr FOR gv_matnr MEMORY ID mat MATCHCODE OBJECT mat1.
"              ^ variable.parameter
"                                             ^ constant
"                                                                  ^ type
SELECT-OPTIONS s_id FOR gv_id VISIBLE LENGTH 10 NO-DISPLAY MODIF ID gr1.
"              ^ variable.parameter
"                                                                   ^ constant
SELECTION-SCREEN ULINE /10(20).
"                       ^ number
"                          ^ number
SELECTION-SCREEN ULINE POS_HIGH(10).
"                      ^ constant.builtin
"                               ^ number
SELECTION-SCREEN ULINE POS_LOW(10).
"                      ^ constant.builtin
"                              ^ number
SELECTION-SCREEN ULINE MODIF ID lin.
"                               ^ constant
SELECTION-SCREEN SKIP: 10, 1, 5.
"                      ^ number
"                          ^ number
"                             ^ number
SELECTION-SCREEN COMMENT /1(50) comm1 MODIF ID mg1. 
"                         ^ number
selection-screen comment /1(50).
"                           ^ number
"                                              ^ constant
SELECTION-SCREEN COMMENT /1(50) for field foo. 
"                                         ^ variable.parameter
SELECTION-SCREEN COMMENT /1(50) bar for field foo. 
"                               ^ variable
"                                             ^ variable.parameter
selection-screen: begin of screen 100 title text as window,
"                                           ^ variable
                  begin of block block with frame title 'text',
"                                ^ constant
                  end of screen 100,
                  end of block block.
"                              ^ constant
SELECTION-SCREEN BEGIN OF SCREEN: 100 as window title abab, 200 as window.
"                                                     ^ variable
selection-screen: begin of screen 100 as subscreen nesting level 5,
                end of screen 100.
