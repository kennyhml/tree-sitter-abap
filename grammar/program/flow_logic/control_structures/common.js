module.exports = {
  others_case_clause: $ =>
    seq(
      ...gen.kws("when", "others"),
      ".",
      field("consequence", optional($.statement_block)),
    ),
};
