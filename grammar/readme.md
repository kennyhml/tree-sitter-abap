# Grammar Design

The grammar structure follows the official [ABAP Programming Language](https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENABAP_REFERENCE.html). Some chapters may be merged for simplicity.

## CST Conventions

- Each semantically meaningful statement addition should be its own visible node. This lets formatters and other tools handle the complete addition as one unit instead of reconstructing it from individual tokens.
- The `_spec` suffix should be used when an addition supplies an operand, value, or structured configuration, such as `report_maximum_width_spec`.
- Flag-only additions should be named after their exact semantic phrase without `_spec`, such as `keeping_directory_entry` or `with_current_switchstates`.
- Rules shared by statements go in the nearest `common.js` when both their syntax and semantics are the same. Reference shared rules directly instead of aliasing them solely to change their names.
- Keep statement prefixes for statement-specific rules. Shared rule names must still be specific enough to remain meaningful in Tree-sitter's global rule namespace; prefer `report_maximum_width_spec` over `maximum_width_spec`.
- Alias only when the same grammar implementation intentionally needs a different public CST node type in a particular context.
- Use hidden aggregator rules for choices and repetitions that only organize the grammar and should not appear in the CST.
- Fields such as `source`, `destination`, `program`, and `entry` or `subject` identify the semantic role of operands.
- Support chained statements only in explicitly designated grammar locations. Do not add chaining merely because ABAP permits it generally or the keyword documentation contains a chained example.

## Parser Size

Measure parser changes with Tree-sitter 0.26.9 using:

```sh
./scripts/measure-parser-size.sh --force-generate --json
tree-sitter generate --report-states-for-rule -
tree-sitter test --json-summary
```

Always run the complete corpus and highlight suite. Successful generation, fewer states, and unchanged `node-types.json` do not guarantee equivalent ambiguity resolution.

### Statement Terminators

Splitting a complete statement into a hidden prefix followed by its period terminator substantially reduces parser states while preserving the visible CST node:

```js
statement: $ => seq($.__statement_prefix, "."),
__statement_prefix: $ => seq(/* statement without its final period */),
```

Write this pattern explicitly. Move only the final required period into the visible wrapper. Keep opening and internal periods inside block prefixes, and do not apply this to optional periods or periods followed by a body.

The initial `read_table_statement` experiment reduced its reported contextual states from 108 to 8. Applied to all 116 qualifying statements and declarations, the measured totals changed as follows:

| Metric | Before | After | Reduction |
| --- | ---: | ---: | ---: |
| States | 25,782 | 22,926 | 2,856 |
| Large states | 12,936 | 11,378 | 1,558 |
| Parse-action groups | 15,181 | 13,814 | 1,367 |
| Generated parser | 80,437,419 bytes | 70,728,082 bytes | 9,709,337 bytes |
| Compiled parser | 56,307,800 bytes | 52,289,624 bytes | 4,018,176 bytes |

Precedence attached to the original complete production may also be needed on its hidden prefix. `macro_include` required this to avoid introducing a conflict.

### Experiments That Did Not Work

- Grouping arithmetic operators with equal precedence produced an identical generated parser.
- Splitting arithmetic precedence levels into named hidden rules increased the generated parser by about 1.66 MB and the compiled parser by about 414 KB.
- Extracting `component_selection` subjects into a hidden rule saved 475 states and about 376 KB compiled, but changed ambiguity resolution and caused corpus failures.
- Extracting dereference subjects saved 106 states and about 381 KB compiled, but changed highlight parsing.
- Extracting substring subjects introduced conflicts with function calls and dynamic `PERFORM` syntax.
- Extracting function-call subjects conflicted with component-selection subjects around `->`.
- Sharing a common call/selection subject added generated size and parser actions for only a negligible compiled-size improvement.
- Reusing concrete keyword rules for `_contextual_keyword` introduced lexical and parse conflicts. The separate contextual keyword regexes are intentional.

These expression and selector rules are highly recursive. A local state or size reduction can change which valid parse wins, so do not retain one unless every corpus tree and highlight assertion remains unchanged.
