module.exports = {
  // BEGIN OF ENUM enum_type [STRUCTURE struc] [BASE TYPE dtype]
  begin_of_enum_spec: $ =>
    seq(
      ...gen.kws("begin", "of", "enum"),
      field("name", $.identifier),
      optional($.enum_structure_spec),
      optional($.enum_base_type_spec),
    ),

  // END OF ENUM enum_type [STRUCTURE struc]
  end_of_enum_spec: $ =>
    seq(
      ...gen.kws("end", "of", "enum"),
      field("name", $.identifier),
      optional($.enum_structure_spec),
    ),

  //val1 [VALUE IS INITIAL], val2 [VALUE val],
  enum_value_spec: $ =>
    seq(
      field("name", $.identifier),
      optional(choice($.initial_value_spec, $.default_data_value_spec)),
    ),

  // BASE TYPE dtype
  enum_base_type_spec: $ =>
    seq(...gen.kws("base", "type"), field("base_type", $.identifier)),

  // STRUCTURE struct
  enum_structure_spec: $ =>
    seq(gen.kw("structure"), field("name", $.identifier)),
};
