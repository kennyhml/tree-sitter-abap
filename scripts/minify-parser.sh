#!/bin/sh

set -eu

parser=${1:-src/parser.c}

if [ ! -f "$parser" ]; then
  printf 'Parser not found: %s\n' "$parser" >&2
  exit 1
fi

# Generated parser tables contain millions of indented lines. Trimming only
# line-edge whitespace keeps the C tokens unchanged while reducing blob size.
perl -pi -e 's/^[ \t]+//; s/[ \t]+$//' "$parser"
