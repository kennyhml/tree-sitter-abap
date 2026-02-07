export function caseInsensitive(...terms) {
    return terms.map((t) => new RustRegex(t
        .split('')
        .map(l => l !== l.toUpperCase() ? `[${l}${l.toUpperCase()}]` : l)
        .join('')
    ));
}

export function caseInsensitiveAliased(...terms) {
    return terms.map(t => alias(caseInsensitive(t).shift(), t))
}

export function kw(keyword) { return caseInsensitiveAliased(keyword).shift() };
export function kws(...keywords) { return caseInsensitiveAliased(...keywords) }

export function kw_field(keyword, node) {
    return seq(
        caseInsensitiveAliased(keyword).shift(),
        field(keyword.replace("-", "_").toLowerCase(), node)
    )
};

export function kws_field(...args) {
    let value = args.pop();
    return seq(
        caseInsensitiveAliased(...args),
        field(args.join("_").toLowerCase(), value)
    )
}