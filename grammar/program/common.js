const gen = require("../core/generators.js")


module.exports = {

    if_found_spec: _ => seq(...gen.kws("if", "found"))

}