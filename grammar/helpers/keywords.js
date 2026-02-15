function caseInsensitive(...terms) {
    return terms.map((t) => new RustRegex(t
        .split('')
        .map(l => l !== l.toUpperCase() ? `[${l}${l.toUpperCase()}]` : l)
        .join('')
    ));
}

function caseInsensitiveAliased(...terms) {
    return terms.map(t => alias(caseInsensitive(t).shift(), t))
}

function kw(keyword) { return caseInsensitiveAliased(keyword).shift() };
function kws(...keywords) { return caseInsensitiveAliased(...keywords) }

function kw_field(keyword, node) {
    return seq(
        caseInsensitiveAliased(keyword).shift(),
        field(keyword.replace("-", "_").toLowerCase(), node)
    )
};

function kws_field(...args) {
    let value = args.pop();
    return seq(
        caseInsensitiveAliased(...args),
        field(args.join("_").toLowerCase(), value)
    )
}

module.exports = {
    caseInsensitive,
    caseInsensitiveAliased,
    kw,
    kws,
    kw_field,
    kws_field
};