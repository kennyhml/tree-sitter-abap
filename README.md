# tree-sitter-abap

**ABAP grammar for [Tree-sitter](https://github.com/tree-sitter/tree-sitter)**, based on the [official ABAP keyword documentation](https://help.sap.com/doc/abapdocu_latest_index_htm/latest).

Tree-sitter performs **incremental parsing**, making it ideal for working with large or legacy ABAP codebases that often span thousands of lines in a single report. The resulting 
parser is compiled to **native C**, enabling significantly better performance than typical regex-based parsers (looking at you, TextMate).

> [!NOTE]  
> This grammar is designed to parse a **superset** of valid ABAP syntax. Its goal is to produce a concrete syntax tree (CST) suitable 
> for code analysis and syntax highlighting, without over-restricting the grammar to perfectly valid ABAP forms.  
>
> In other words, it is intentionally **permissive**. For example, the following is invalid ABAP but will still be parsed:
>
> ```abap
> types foo type i value 10.
> ```

## WIP
- [x] Data Declarations
- [x] Elementary Types
- [x] Table Types & Keys
- [x] Range Table Types
- [x] Struct Types
- [x] Class/Interface Definitions
- [x] Method Declarations (Events, AMDP, Tests..)
- [x] Basic Comments
- [x] Inline declarations
- [ ] Unary & Binary expressions
- [ ] ABAP SQL, including CTE
- [ ] Table access
- [ ] ABAPdoc
- [ ] IF statements
- [ ] Loops (while, do, loop at..)
- [ ] Value statements
- [ ] Reduce Statements
- [x] Method Calls
- [ ] (Async) Function Calls
- [ ] Class-based exceptions
- [x] Builtins
- [ ] String-Templates
- [ ] Dynpro Selection Screen
- [ ] `MESSAGE` instruction
- [ ] `WRITE` instruction
- [ ] `CONCATENATE` instruction
- [ ] `REPLACE` instruction
- [x] Pragmas
- [x] Pseudo Comments
- [ ] Macros
- [ ] Timestamp instructions
