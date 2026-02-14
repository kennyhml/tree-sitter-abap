import loop_at_rules from './loop_at.js'

export default {

    control_statement: $ => choice(
        $.loop_at_statement
    ),

    ...loop_at_rules
}