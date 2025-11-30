# tree-sitter-abap
**ABAP grammar for [Tree-sitter](https://github.com/tree-sitter/tree-sitter)**, based on the [official ABAP keyword documentation](https://help.sap.com/doc/abapdocu_latest_index_htm/latest).

Tree-sitter performs **incremental parsing**, making it ideal for working with large or legacy ABAP codebases that often span thousands of lines in a single report. The resulting 
parser is compiled to **native C**, enabling significantly better performance than typical regex-based parsers (such as TextMate).

The syntactical structure adheres closely to the conventions provided in the publicly available documentation.
If you think you know most of the ABAP syntax, try writing a parser. Certainly a humbling experience.

> [!NOTE]  
> This grammar is designed to parse a **superset** of valid ABAP syntax. Its goal is to produce a concrete syntax tree (CST) suitable 
> for code analysis and syntax highlighting, without over-restricting the grammar to perfectly valid ABAP forms.  
>
> In other words, it is intentionally **permissive**. For example, the following is invalid ABAP but will still be parsed:
>
> ```abap
> types foo type i value 10.
> ```
> Additionally, purely in terms of available syntax, ambiguity can exist. Consider the following expression:
> ```abap
> new type( foo = 'A' bar = 'B' )
> ```
> Its impossible to know whether `foo = 'A' bar = 'B'` is a specification of parameters for a class or component assignments for a structure.
> This could only be determined by having context of the codebase and knowing the concrete type of `type`. For this reason, the
> parser generates a generic `argument_list` for an expression like this.
