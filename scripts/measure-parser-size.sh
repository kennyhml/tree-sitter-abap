#!/bin/sh

set -eu

root=$(git rev-parse --show-toplevel)
tree_sitter=${TREE_SITTER_BIN:-tree-sitter}
compiled_parser=$(mktemp "${TMPDIR:-/tmp}/tree-sitter-abap-parser.XXXXXX")
trap 'rm -f "$compiled_parser"' EXIT HUP INT TERM

cd "$root"
if [ "${1:-}" = "--force-generate" ] ||
  [ ! -f src/parser.c ] ||
  [ -n "$(find grammar grammar.js -type f -newer src/parser.c -print -quit)" ]; then
  "$tree_sitter" generate >&2
fi
"$tree_sitter" build --output "$compiled_parser" . >&2

generated_bytes=$(wc -c < src/parser.c | tr -d ' ')
compiled_bytes=$(wc -c < "$compiled_parser" | tr -d ' ')

if [ "${1:-}" = "--json" ] || [ "${2:-}" = "--json" ]; then
  printf '{"generated_parser_bytes":%s,"compiled_parser_bytes":%s}\n' \
    "$generated_bytes" "$compiled_bytes"
else
  printf 'Parser size\n'
  printf '  generated src/parser.c: %s bytes\n' "$generated_bytes"
  printf '  compiled parser:       %s bytes\n' "$compiled_bytes"
fi
