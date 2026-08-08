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

