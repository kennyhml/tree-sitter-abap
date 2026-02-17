# tree-sitter-abap
**ABAP grammar for [Tree-sitter](https://github.com/tree-sitter/tree-sitter)**, based on the [official ABAP keyword documentation](https://help.sap.com/doc/abapdocu_latest_index_htm/latest).

> [!NOTE]  
> This grammar is designed to parse a **superset** of valid ABAP syntax. Its goal is to produce a concrete syntax tree (CST) suitable 
> for code analysis and syntax highlighting, without over-restricting the grammar to perfectly valid ABAP forms.  
>
> In other words, it is intentionally **permissive**.

## Limitations
ABAP is a very unique language in many ways and, likely due to its long history, is often very difficult to parse.
### Ambiguity
Consider the following expression:
```abap
new bar( 'Hello World' )
```
It's impossible to know whether the constructor of the class `bar` is being invoked or if a char-like anonymous data object is being created.
This could only be determined by having context of the codebase and knowing the concrete type of `bar`. For this reason, the parser outputs a fairly
generic `argument_list`. If further detail is required, a semantic analysis is needed (with access to things such as the DDIC).

### Keyword chaining
You're likely aware that you can chain e.g data object declarations:
```abap
data: foo type i, bar type string, baz type zmytab.
```
This is easily supported. However, chaining is far more dynamic than many are aware of.
The following statement:
```abap
replace all occurrences of foo in bar with ''.
replace all occurrences of foo in baz with ''.
```
Can also be expressed, without changing the effects, as **any** of these variation:
```abap
replace all occurrences of foo in: bar with '', baz with ''.
replace all occurrences of foo: in bar with '', in baz with ''.
replace all occurrences: of foo in bar with '', of foo in baz with ''.
replace all: occurrences of foo in bar with '', occurrences of foo in baz with ''.
replace: all occurrences of foo in bar with '', all occurrences of foo in baz with ''.
```
You get the gist, ABAP effectively yanks everything before the `:` and inserts it before each comma seperated section after it.
Needless to say, this isnt only annoying to parse but practically impossible, as
- All the possible variations, even if the permutations are generated, would massively blow up the parsers internal state count
- You can no longer assign nodes in the resulting CST a meaningful grouping, as context may be split.
- Due to the unclear grouping of tokens, its not feasible to preprocess the code to make parsing easier.

As a result, the grammar makes an effort to support chained statements where they often times used. For example, when declaring
a structure type or defining dynpro parameters. Excessively using this "quirk" has been discouraged for a long time and tools 
such as the official ABAP Formatter provide the ability to transform such statements into their longform (and proper) variant.

## Obsolete Language Elements
Many obsolete language elements, as specified in the official ABAP documentation, are currently out of scope and will not be supported.
Some language elements that are still commonly found in On Premise / Private Cloud Systems may be supported despite officially marked as obsolete - 
for example the addition `IN BACKGROUND TASK` of a function call.

## Design
### Project Layout
As ABAP contains an excessively large number of syntax variants to cover, parts of the grammar are split apart into their own sub-directories
within the `grammar/` folder and later consolidated into the main `grammar.js`. This allows for cohesive grouping of language features, such
as Dynpro-, ABAP OO-, or ABAP SQL Elements.

### Syntax Trees
None of the syntax trees should be considered final / stable in the near future. The current idea is to encapsulate what ABAP often calls 'additions'
in the keyword documentation in `_spec` nodes (potentially to be renamed into `_addition`). Additionally, each keyword has a visible node representation in the tree. 
This choice was inspired by the tree-sitter-sql grammar and makes it easier to work with the syntax tree without forcing a full lower-/uppercase convention in post processing,
as otherwise matching would require a case insensitive regex everywhere and aliasing makes you lose the original case.

## Why tree-sitter?
Tree-sitter performs **incremental parsing**, making it ideal for working with large or legacy ABAP codebases that often span thousands of lines in a single report. The resulting 
parser is compiled to **native C**, enabling significantly better performance than typical regex-based parsers (such as TextMate).

