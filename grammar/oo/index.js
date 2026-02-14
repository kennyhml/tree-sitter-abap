import common_rules from "./common.js";
import class_definition_rules from "./class_definition.js";
import interface_definition_rules from "./interface_definition.js";
import method_declaration_rules from "./methods_declaration.js";
import aliases_rules from "./aliases.js";

export default {
    ...common_rules,
    ...class_definition_rules,
    ...interface_definition_rules,
    ...method_declaration_rules,
    ...aliases_rules
}