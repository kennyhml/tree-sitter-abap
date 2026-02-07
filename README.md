# tree-sitter-abap
**ABAP grammar for [Tree-sitter](https://github.com/tree-sitter/tree-sitter)**, based on the [official ABAP keyword documentation](https://help.sap.com/doc/abapdocu_latest_index_htm/latest).

> [!NOTE]  
> This grammar is designed to parse a **superset** of valid ABAP syntax. Its goal is to produce a concrete syntax tree (CST) suitable 
> for code analysis and syntax highlighting, without over-restricting the grammar to perfectly valid ABAP forms.  
>
> In other words, it is intentionally **permissive**. For example, the following is invalid ABAP but will still be parsed:
>
> ```abap
> types foo type i value 10.
> ```
> Additionally, purely in terms of syntax analysis, problems with ambiguity can exist. Consider the following expression:
> ```abap
> new bar( 'Hello World' )
> ```
> It's impossible to know whether the constructor of the class `bar` is being invoked or if a char-like anonymous data object is being created on the heap.
> This could only be determined by having context of the codebase and knowing the concrete type of `bar`. For this reason, the parser outputs a fairly
> generic `argument_list`. If further detail is required, a semantic analysis is needed (with access to things such as the DDIC).
>
> **Obsolete language elements, as specified in the official ABAP documentation, are currently out of scope and will not be supported.**

## Design
As ABAP contains an excessively large number of syntax variants to cover, parts of the grammar are split apart into their own sub-directories
within the `grammar/` folder and later consolidated into the main `grammar.js`. This allows for cohesive grouping of language features, such
as Dynpro-, ABAP OO-, and ABAP SQL Elements. Supposedly, it also leads to better context for AI tools (unconfirmed).

## Why tree-sitter?
Tree-sitter performs **incremental parsing**, making it ideal for working with large or legacy ABAP codebases that often span thousands of lines in a single report. The resulting 
parser is compiled to **native C**, enabling significantly better performance than typical regex-based parsers (such as TextMate).

