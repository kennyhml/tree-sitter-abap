const utils = require("../core/utils.js");

module.exports = {

    program_statement: $ => choice(
        $.report_statement,
        $.include_statement,
        $.tables_declaration,
        $.form_definition,
        $.perform_statement
    ),

    ...utils.importDirectoryRules(__dirname)
}