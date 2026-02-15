const loop_at_statement_rules = require("./loop_at_statement.js");
const if_statement_rules = require("./if_statement.js");
const while_statement_rules = require("./while_statement.js");
const try_statement_rules = require("./try_statement.js");
const case_statement_rules = require("./case_statement.js");
const case_type_statement_rules = require("./case_type_statement.js");
const do_statement_rules = require("./do_statement.js");
const flow_statement_rules = require("./flow_statements.js");
const raise_statement_rules = require("./raise_statement.js");

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

    ...loop_at_statement_rules,
    ...if_statement_rules,
    ...while_statement_rules,
    ...try_statement_rules,
    ...case_statement_rules,
    ...case_type_statement_rules,
    ...do_statement_rules,
    ...flow_statement_rules,
    ...raise_statement_rules
}