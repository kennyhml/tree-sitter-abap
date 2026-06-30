module.exports = {
  inline_comment: (_) => prec(0, seq('"', /[^\n\r]*/)),
};
