import common_rules from "./common.js";
import class_rules from "./class.js";
import interface_rules from "./interface.js";
import method_rules from "./methods.js";
import aliases_rules from "./aliases.js";

export default {
    ...common_rules,
    ...class_rules,
    ...interface_rules,
    ...method_rules,
    ...aliases_rules
}