module.exports = {
  if_found: _ => seq(...gen.kws("if", "found")),

  until_spec: $ =>
    seq(gen.kw("until"), field("condition", $._logical_expression)),
};
