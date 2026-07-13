> [!WARNING]
> The grammar is still very much work in progress and still missing a large if not most of the language features as of July 2026.
> The structure of the CST is bound to change multiple times over and as such is not to be considered stable by any means.
>
> You can check the current state of the parser at the bottom of this introduction.
>
> **Heads up: AI generated contributions are not welcome. Its simply not good at this stuff.**

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
It's impossible to know whether the constructor of the class `bar` is being invoked or if a char-like data object is being created.
This could only be determined by having context of the codebase and knowing the concrete type of `bar`. For this reason, the parser outputs a fairly
generic `argument_list`.
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

As a result, the grammar makes an effort to support chained statements where they are often times used. For example, when declaring
a structure type or defining dynpro parameters. Excessively using this "quirk" has been discouraged for a long time and tools 
such as the official ABAP Formatter provide the ability to transform such statements into their longform (and proper) variant.
### Locals
Tree-sitter offers a system to tag nodes in the syntax tree that introduce a scope, declare a variable or reference such a variable.
As ABAP usually splits these concerns into completely different scopes (includes in programs, declaration section of a class) its cant
easily be supported. Its also worth noting that upstream Tree-sitter has moved away from this system anyways as it is a task better
suited for a language server.
## Obsolete Language Elements
Many obsolete language elements, as specified in the official ABAP documentation, are currently out of scope and will not be supported.
Some language elements that are still commonly found in On Premise / Private Cloud Systems may be supported despite officially marked as obsolete - 
for example the addition `IN BACKGROUND TASK` of a function call, or selection-screen statements.

## Completion rate
The following language features are currently implemented:
- [x] Declaration of data objects
- [x] Declarations of types including table types
- [x] Selection screens statements
- [x] Declaring and using form routines
- [x] Control Flow (if, case, loop at..)
- [x] Defining classes, interfaces and method (except RAP and AMDP behavior) 
- [x] Calling of functions, methods and function modules
- [x] Arithmetic expressions
- [x] String expressions (including string templates)
- [x] Calculation expressions
- [x] Bitwise expressions
- [x] All constructor expressions (value, new, cond, switch, ref, reduce...)
- [x] Table expressions
- [x] Component selections
- [x] Iteration expressions (for ... in / while / until )
- [x] Table comprehensions
- [x] All string and byte processing statements (split, concatenate, find..)
- [x] All date and time processing statements (get time stamp, convert time stamp..)
- [x] All table processing statements (insert, read, delete, append...) 
      
Partially completed categories are not mentioned here.
For a more detailed look, you can refer to the test cases in the `test/corpus/` directory.
### Significant language features the grammar is **missing**:
- [ ] **ABAP SQL**
- [ ] RAP behavior implementation related statements in classes
- [ ] EML statements
- [ ] Dynpro modules
