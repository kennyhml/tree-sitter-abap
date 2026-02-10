import common_rules from './common.js'
import parameters_rules from './parameters.js'
import select_options_rules from './select_options.js'
import selection_screen_rules from './selection_screen.js'

export const dynpro_rules = {

    _dynpro_statement: $ => choice(
        $.selection_screen_statement,
        $.parameters_declaration,
        $.select_options_declaration,
        $.call_sel_screen_statement,
    ),

    ...common_rules,
    ...parameters_rules,
    ...select_options_rules,
    ...selection_screen_rules
};