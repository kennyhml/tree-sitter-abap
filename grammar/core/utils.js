const fs = require('fs');
const path = require('path');


function importDirectoryRules(dir) {
    const rules = {};
    const currentFile = path.basename(dir);

    fs.readdirSync(dir).forEach(file => {
        if (file.endsWith('.js') && file !== currentFile) {
            const imported = require(path.join(dir, file));
            Object.assign(rules, imported);
        }
    });

    return rules
}


module.exports = {
    importDirectoryRules

}