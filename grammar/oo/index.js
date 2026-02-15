const common_rules = require("./common.js");
const class_rules = require("./class.js");
const interface_rules = require("./interface.js");
const method_rules = require("./methods.js");
const aliases_rules = require("./aliases.js");

module.exports = {
    ...common_rules,
    ...class_rules,
    ...interface_rules,
    ...method_rules,
    ...aliases_rules
}