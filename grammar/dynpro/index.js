import common_rules from './common.js'
import parameters_rules from './parameters.js'
import select_options_rules from './select_options.js'

export const dynpro_rules = {
    ...common_rules,
    ...parameters_rules,
    ...select_options_rules
};