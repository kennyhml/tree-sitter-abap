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
