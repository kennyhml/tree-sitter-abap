READ ENTITY IN LOCAL MODE WITH CHANGES demo_root
"                                      ^ type
  FROM read_keys
"      ^ variable
  RESULT entities
"        ^ variable
  BY \_items
"    ^ operator
"     ^ type
  FIELDS ( item_id amount ) WITH item_keys
"          ^ variable.member
"                  ^ variable.member
"                                       ^ variable
  RESULT items
"        ^ variable
  LINK item_links
"      ^ variable
  EXECUTE calculate_total
"         ^ function.method
  FROM function_parameters
"      ^ variable
  REQUEST requested_fields
"         ^ variable
  RESULT calculation_result
"        ^ variable
  FAILED failed
"        ^ variable
  REPORTED reported.
"          ^ variable

READ ENTITIES IN LOCAL MODE
  OPERATIONS operation_table
"            ^ variable
  FAILED failed
"        ^ variable
  REPORTED reported.
"          ^ variable

READ ENTITIES FORWARDING PRIVILEGED
  OPERATIONS privileged_operations
"            ^ variable
  FAILED privileged_failed.
"        ^ variable

READ ENTITY demo_root
  FIELDS (
    root_field
"   ^ variable.member
    _detail +(
"   ^ variable.member
      child_a
"     ^ variable.member
      _nested (
"     ^ variable.member
        nested_a
"       ^ variable.member
        _leaf +(
"       ^ variable.member
          leaf_a
"         ^ variable.member
          leaf_b
"         ^ variable.member
        )
      )
    )
  ) WITH read_keys
"        ^ variable
  RESULT entities.
"        ^ variable

READ ENTITIES OF demo_root IN LOCAL MODE
"                ^ type
  ENTITY root
"        ^ type
    FIELDS ( root_id status ) WITH root_keys
"            ^ variable.member
"                    ^ variable.member
"                                  ^ variable
    RESULT roots
"          ^ variable
  ENTITY item
"        ^ type
    ALL FIELDS WITH item_keys
"                   ^ variable
    RESULT items
"          ^ variable
  WITH CHANGES
  FAILED failed
"        ^ variable
  REPORTED reported.
"          ^ variable

MODIFY ENTITY IN LOCAL MODE demo_root
"                           ^ type
  CREATE AUTO FILL CID FIELDS ( root_id status ) WITH create_rows
"                               ^ variable.member
"                                       ^ variable.member
"                                                     ^ variable
  CREATE BY \_items AUTO FILL CID SET FIELDS WITH item_rows
"           ^ operator
"            ^ type
"                                                   ^ variable
  EXECUTE approve FROM action_rows RESULT action_result
"         ^ function.method
"                      ^ variable
"                                         ^ variable
  FAILED failed
"        ^ variable
  MAPPED mapped
"        ^ variable
  REPORTED reported.
"          ^ variable

MODIFY ENTITIES OF demo_root IN LOCAL MODE
"                  ^ type
  ENTITY root
"        ^ type
    CREATE FIELDS ( root_id status ) WITH create_rows
"                   ^ variable.member
"                           ^ variable.member
"                                         ^ variable
  ENTITY item
"        ^ type
    UPDATE SET FIELDS WITH update_rows
"                          ^ variable
  FAILED failed
"        ^ variable
  MAPPED mapped
"        ^ variable
  REPORTED reported.
"          ^ variable

MODIFY ENTITIES FORWARDING PRIVILEGED
  OPERATIONS operation_table
"            ^ variable
  FAILED failed.
"        ^ variable
