data foo type bar value 'baz'.
"<- keyword
"    ^ variable
"             ^ type
data(inline) = 'baz'
"    ^ variable
final(immutable) = 123.
"     ^ variable
constants myconst type abap_bool value abap_undefined.
"<- keyword
"         ^ constant
"                      ^ type
"                                      ^ constant.builtin
constants myconst type i value is initial.
"         ^ constant
"                      ^ type.builtin
"                                 ^ keyword
field-symbols <symbol> type x read-only.
"<- keyword
"              ^ variable
"                           ^ type.builtin
"                              ^ keyword
loop at itab assigning field-symbol(<inline>). endloop.
"                                    ^ variable
DATA: one TYPE abap_bool VALUE abap_true, two TYPE abap_bool VALUE abap_false.
"     ^ variable
"              ^ type
"                              ^ constant.builtin
"                                         ^ variable
"                                                  ^ type
"                                                                  ^ constant.builtin
DATA: BEGIN OF s1, c1 TYPE c VALUE '1', c2 TYPE c VALUE '2', END OF s1, foo type bar.
"              ^ variable
"                          ^ type.builtin
"                                               ^ type.builtin
"                  ^ variable.member
"                                       ^ variable.member
"                                                                   ^ variable
DATA: BEGIN OF s1, c1 TYPE c, begin of s2, c2 TYPE c, end of s2, END OF s1.
"              ^ variable
"                  ^ variable.member
"                                      ^ variable.member
"                                          ^ variable.member
"                                                            ^ variable.member
"                                                                       ^ variable
CONSTANTS: BEGIN OF s1, c1 TYPE c, begin of s2, c2 TYPE c, end of s2, END OF s1.
"                   ^ constant
"                       ^ variable.member
"                                           ^ variable.member
"                                               ^ variable.member
"                                                                 ^ variable.member
"                                                                            ^ constant
TABLES: table_wa, table_wa2.
"       ^ variable
"                 ^ variable

STATICS static TYPE i VALUE 10. 
"       ^ variable
"                   ^ type.builtin
STATICS: begin of struct,
"                 ^ variable
         field1 type i value 999,
"        ^ variable.member
         field2 type c length 10 value 'Hello',
"        ^ variable.member
         end of struct,
"               ^ variable
         foo type bar.
"        ^ variable

DATA:
  BEGIN OF first_data,
"          ^ variable
    field_a TYPE i,
"   ^ variable.member
    field_b TYPE string,
"   ^ variable.member
  END OF first_data,
"        ^ variable
  BEGIN OF second_data,
"          ^ variable
    field_c TYPE i,
"   ^ variable.member
    field_d TYPE string,
"   ^ variable.member
  END OF second_data.
"        ^ variable

DATA:
  BEGIN OF outer_data,
"          ^ variable
    outer_field TYPE i,
"   ^ variable.member
    BEGIN OF inner_data,
"            ^ variable.member
      inner_field_a TYPE i,
"     ^ variable.member
      inner_field_b TYPE string,
"     ^ variable.member
    END OF inner_data,
"          ^ variable.member
  END OF outer_data.
"        ^ variable

CONSTANTS:
  BEGIN OF first_constants,
"          ^ constant
    msgid TYPE symsgid VALUE message_class,
"   ^ variable.member
    msgno TYPE symsgno VALUE '001',
"   ^ variable.member
  END OF first_constants,
"        ^ constant
  BEGIN OF second_constants,
"          ^ constant
    msgid TYPE symsgid VALUE message_class,
"   ^ variable.member
    msgno TYPE symsgno VALUE '002',
"   ^ variable.member
  END OF second_constants.
"        ^ constant

CONSTANTS:
  message_class TYPE symsgid VALUE '/DMO/CM_AGENCY',
" ^ constant
  BEGIN OF name_required,
"          ^ constant
    msgid TYPE symsgid VALUE message_class,
"   ^ variable.member
    msgno TYPE symsgno VALUE '001',
"   ^ variable.member
  END OF name_required,
"        ^ constant
  BEGIN OF email_invalid_format,
"          ^ constant
    msgid TYPE symsgid VALUE message_class,
"   ^ variable.member
    msgno TYPE symsgno VALUE '002',
"   ^ variable.member
  END OF email_invalid_format.
"        ^ constant

CONSTANTS:
  BEGIN OF outer_constants,
"          ^ constant
    outer_value TYPE i VALUE 1,
"   ^ variable.member
    BEGIN OF inner_constants,
"            ^ variable.member
      inner_value_a TYPE i VALUE 2,
"     ^ variable.member
      inner_value_b TYPE i VALUE 3,
"     ^ variable.member
    END OF inner_constants,
"          ^ variable.member
  END OF outer_constants.
"        ^ constant

STATICS:
  BEGIN OF first_statics,
"          ^ variable
    field_a TYPE i,
"   ^ variable.member
    field_b TYPE string,
"   ^ variable.member
  END OF first_statics,
"        ^ variable
  BEGIN OF second_statics,
"          ^ variable
    field_c TYPE i,
"   ^ variable.member
    field_d TYPE string,
"   ^ variable.member
  END OF second_statics.
"        ^ variable

STATICS:
  BEGIN OF outer_statics,
"          ^ variable
    outer_field TYPE i,
"   ^ variable.member
    BEGIN OF inner_statics,
"            ^ variable.member
      inner_field_a TYPE i,
"     ^ variable.member
      inner_field_b TYPE string,
"     ^ variable.member
    END OF inner_statics,
"          ^ variable.member
  END OF outer_statics.
"        ^ variable
