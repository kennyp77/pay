const fs = require('fs');
const path = require('path');

const NEW_COMMANDS_DIR = path.resolve(__dirname, '../commands');

/** Добвляет команды из определенного файла
 * @param browser
 * @param file
 */
function addCommandsFromFile(browser, file) {
    const fileContent = require(file);

    if (typeof fileContent !== 'object') {
        throw new Error(`Invalid export command from file '${file}'`);
    }

    Object.keys(fileContent).forEach((key) => browser.addCommand(key, fileContent[key]));
}

/**
 * Добавляет новые команды
 * Смотрим JS файлы из папки ../commands
 * @param {Object} browser
 */
function newCommands(browser) {
    fs.readdirSync(NEW_COMMANDS_DIR)
        .map((filename) => path.resolve(NEW_COMMANDS_DIR, filename))
        .filter((filepath) => path.extname(filepath) === '.js')
        .forEach((filepath) => addCommandsFromFile(browser, filepath));
}

/**
 * Дополняем команды Гермионы
 * @param {Object} browser
 */
module.exports = function getCommands(browser) {
    newCommands(browser);
};
