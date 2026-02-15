const common_rules = require("./common.js");
const parameters_rules = require("./parameters.js");
const select_options_rules = require("./select_options.js");
const selection_screen_rules = require("./selection_screen.js");

module.exports = {

    dynpro_statement: $ => choice(
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