module.exports = {

  _visibility: _ => choice(...gen.kws("public", "protected", "private")),

  abstract: _ => gen.kw("abstract"),

  read_only: _ => gen.kw("read-only"),

  for_testing: _ => seq(...gen.kws("for", "testing")),

  final: _ => gen.kw("final"),

  public: _ => gen.kw("public"),

}
