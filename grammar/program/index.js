import report_statement_rules from './report_statement.js'
import include_statement_rules from './include_statement.js'
import tables_declaration_rules from './tables_declaration.js'
import form_rules from './forms.js'

export default {

    program_statement: $ => choice(
        $.report_statement,
        $.include_statement,
        $.tables_declaration,
        $.form_definition
    ),

    ...report_statement_rules,
    ...include_statement_rules,
    ...tables_declaration_rules,
    ...form_rules,
}