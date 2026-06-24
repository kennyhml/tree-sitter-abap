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
