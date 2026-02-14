import loop_at_statement_rules from './loop_at_statement.js'
import if_statement_rules from './if_statement.js'

export default {

    control_statement: $ => choice(
        $.loop_at_statement,
        $.if_statement
    ),

    ...loop_at_statement_rules,
    ...if_statement_rules,
}