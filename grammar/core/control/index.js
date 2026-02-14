import loop_at_statement_rules from './loop_at_statement.js'
import if_statement_rules from './if_statement.js'
import while_statement_rules from './while_statement.js'
import try_statement_rules from './try_statement.js'
import case_statement_rules from './case_statement.js'

export default {

    control_statement: $ => choice(
        $.try_statement,
        $.loop_at_statement,
        $.if_statement,
        $.while_statement,

        $.case_statement,
        $.type_case_statement,
        $.do_statement,
    ),

    ...loop_at_statement_rules,
    ...if_statement_rules,
    ...while_statement_rules,
    ...try_statement_rules,
    ...case_statement_rules
}