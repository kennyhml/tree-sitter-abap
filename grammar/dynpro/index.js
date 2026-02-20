const utils = require("../core/utils.js");

module.exports = {

    dynpro_statement: $ => choice(
        $.selection_screen_statement,
        $.parameters_declaration,
        $.select_options_declaration,
        $.call_sel_screen_statement,
    ),

    ...utils.importDirectoryRules(__dirname)
};