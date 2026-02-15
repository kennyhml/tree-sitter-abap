const { kws } = require('../helpers/keywords.js')


module.exports = {

    if_found_spec: _ => seq(...kws("if", "found"))

}