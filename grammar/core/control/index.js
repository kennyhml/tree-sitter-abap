const utils = require('../utils.js');

module.exports = {

    control_statement: $ => choice(
        $.try_statement,
        $.loop_at_statement,
        $.loop_at_group_statement,
        $.if_statement,
        $.while_statement,
        $.case_statement,
        $.case_type_of_statement,
        $.do_statement,
        $.return_statement,
        $.exit_statement,
        $.continue_statement,
        $.check_statement,
        $.raise_statement,
        $.raise_exception_statement,
        $.resume_statement,
    ),

    ...utils.importDirectoryRules(__dirname)
}