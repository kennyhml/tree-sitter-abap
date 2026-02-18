const concatenate_statement_rules = require("./concatenate_statement.js")
const condense_statement_rules = require("./condense_statement.js")
const find_statement_rules = require("./find_statement.js")
const replace_statement_rules = require("./replace_statement.js")
const shift_statement_rules = require("./shift_statement.js")
const split_statement_rules = require("./split_statement.js")
const clear_statement_rules = require("./clear_statement.js")
const free_statement_rules = require("./free_statement.js")
const delete_statement_rules = require("./delete_statement.js")
const common_rules = require("./common.js")

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
    ),

    ...concatenate_statement_rules,
    ...condense_statement_rules,
    ...find_statement_rules,
    ...replace_statement_rules,
    ...shift_statement_rules,
    ...split_statement_rules,
    ...clear_statement_rules,
    ...free_statement_rules,
    ...delete_statement_rules,
    ...common_rules
}