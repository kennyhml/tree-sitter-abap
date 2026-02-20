const utils = require('../utils.js');

module.exports = {

    processing_statement: $ => choice(
        $.concatenate_statement,
        $.condense_statement,
        $.find_statement,
        $.replace_statement,
        $.shift_statement,
        $.split_statement,
        $.clear_statement,
        $.free_statement,
        $.delete_statement,
        $.read_table_statement,
        $.add_statement
    ),

    ...utils.importDirectoryRules(__dirname)
};