module.exports = {
  // [ID group [SUBKEY sub]
  checkpoint_id_spec: $ =>
    seq(
      gen.kw("id"),
      field("group", $.identifier),
      optional(
        seq(gen.kw("subkey"), field("subkey", $.character_like_expression)),
      ),
    ),

  // [FIELDS val1 val2 ...]
  checkpoint_fields_spec: $ =>
    prec.right(seq(gen.kw("fields"), repeat1($.general_expression))),
};
