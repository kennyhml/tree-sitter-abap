GET TIME FIELD time.
"              ^ variable
GET TIME STAMP FIELD time.
"                    ^ variable
CONVERT TIME STAMP timestamp
"                  ^ variable
        TIME ZONE 'UTC' 
        INTO DATE dat TIME tim
"                 ^ variable
"                          ^ variable
        DAYLIGHT SAVING TIME dst.
"                            ^ variable
CONVERT DATE dat TIME tim DAYLIGHT SAVING TIME abap_true
"            ^ variable
"                     ^ variable
"                                              ^ constant.builtin
        INTO TIME STAMP time_stamp TIME ZONE 'EST'.
"                       ^ variable
CONVERT DATE dat TIME tim
"            ^ variable
"                     ^ variable
        DAYLIGHT SAVING TIME abap_false
"                            ^ constant.builtin
        TIME ZONE 'EST' 
        INTO UTCLONG time_stamp. 
"                    ^ variable
