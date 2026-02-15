const report_statement_rules = require("./report_statement.js");
const include_statement_rules = require("./include_statement.js");
const tables_declaration_rules = require("./tables_declaration.js");
const perform_statement_rules = require("./perform_statement.js");
const common_rules = require("./common.js");
const form_rules = require("./form.js");

module.exports = {

    program_statement: $ => choice(
        $.report_statement,
        $.include_statement,
        $.tables_declaration,
        $.form_definition,
        $.perform_statement
    ),

    ...report_statement_rules,
    ...include_statement_rules,
    ...tables_declaration_rules,
    ...form_rules,
    ...perform_statement_rules,
    ...common_rules
}