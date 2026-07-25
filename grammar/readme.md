# Grammar Design

The grammar structure follows the official [ABAP Programming Language](https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENABAP_REFERENCE.html). Some chapters may be merged for simplicity.

## CST Conventions

The CST is a public interface for queries, formatters, and other tools. Rule names and nesting should describe the source construct without exposing grammar-only organization.

### Visibility and Reuse

- Unprefixed rules are public and visible in the CST.
- A single leading underscore marks a hidden rule that is intentionally reusable outside its defining file. Put reusable rules in the nearest meaningful `common.js`.
- A double leading underscore marks a hidden implementation helper that is used only within its defining file.
- Choices and repetitions that only organize the grammar are hidden aggregators. Do not add a visible node that merely wraps other visible nodes.
- When the same public construct needs different grammar in different contexts, implement each variation as a hidden rule and alias it to the canonical public node. Use `_` for a shared implementation and `__` for a file-local implementation.

### Specifications and Modifiers

Each semantically meaningful statement addition should be represented as one complete visible unit. Whether that unit uses `_spec` depends on its role rather than simply whether it contains named children.

- Use `*_spec` for every item of an explicitly supported chained statement.
- Use `*_spec` for a complete keyword-introduced clause that supplies an operand, target, value, range, mode, or structured configuration. Examples include `into_spec`, `assigning_spec`, `pcre_spec`, and `using_key_spec`.
- Name an independent atomic modifier after its exact semantic phrase without `_spec`. Examples include `public`, `abstract`, and `redefinition`.
- When a keyword introduces a family of mutually exclusive configurations, use one `*_spec` parent for the complete clause and bare semantic children for the selected alternative.
- A keyword-only alternative can therefore appear beneath a spec. The absence of named children does not automatically make something an independent modifier.
- Do not invent an abstract parent solely to group related modifiers. The parent must correspond to an actual clause in the source syntax.

| Source construct | Preferred CST | Reason |
| --- | --- | --- |
| `INTO wa` | `(into_spec work_area: (...))` | Complete addition with a target |
| `ASSIGNING <fs>` | `(assigning_spec target: (...))` | Complete addition with a target |
| `PCRE pattern` | `(pcre_spec pattern: (...))` | Selects a pattern kind and supplies a value |
| `PUBLIC` | `(public)` | Independent atomic modifier |
| `REDEFINITION` | `(redefinition)` | Independent atomic modifier |
| `TRANSPORTING NO FIELDS` | `(transporting_spec (no_fields))` | `NO FIELDS` selects a transporting configuration |
| `TRANSPORTING comp1 comp2` | `(transporting_spec (component_list ...))` | Another configuration of the same clause |
| `COMPARING NO FIELDS` | `(comparing_spec (no_fields))` | The alternative is scoped by its parent clause |
| A supported chained declaration item | `(data_spec ...)` | Every chain item has a stable visible boundary |

The parent-child form makes broad and specific queries straightforward:

```scheme
(transporting_spec)                 ; any TRANSPORTING configuration
(transporting_spec (no_fields))     ; specifically TRANSPORTING NO FIELDS
(comparing_spec (no_fields))        ; the same alternative in a different clause
```

### Canonical Names

- Reuse one public name wherever a construct represents the same query concept. Do not add a statement-owner prefix solely to disambiguate where it occurs.
- Qualify a name when the same keyword represents genuinely different query concepts. Prefer the semantic role over the owning statement.
- Keep fields such as `source`, `destination`, `program`, `entry`, and `subject` consistent because they identify operand roles independently of node names.

| Concept | Public name | Why it is distinct |
| --- | --- | --- |
| A key definition in a table type | `table_key_definition_spec` | Defines the structure and properties of a key |
| `TABLE KEY ...` during internal-table access | `table_key_spec` | Selects a key for an access operation |
| `FROM wa [USING KEY ...]` | `from_work_area_spec` | Supplies a work area rather than a range boundary |
| `FROM idx` in a line range | `lines_from_spec` | Supplies the lower index of a range |
| A chained `MESSAGE` statement item | `message_spec` | Complete message construction queried as its own concept |
| A message receiver in another statement | A context-qualified spec | Same keyword, but a different query concept |

### Chaining

- Support chained statements only in explicitly designated grammar locations. Do not add chaining merely because ABAP permits it generally or the keyword documentation contains a chained example.
- Every supported chain item must have a visible `*_spec` boundary, even when the item itself is keyword-only.

## Performance considerations

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
- Reusing concrete keyword rules for `__contextual_keyword` introduced lexical and parse conflicts. The separate contextual keyword regexes are intentional.

These expression and selector rules are highly recursive. A local state or size reduction can change which valid parse wins, so do not retain one unless every corpus tree and highlight assertion remains unchanged.
