const fs = require('fs');
const os = require('os');
const path = require('path');

const PROJECT_PATH = path.resolve(__dirname, '..');

/**
 * Возвращает путь относительно домашней дириктории пользователя
 * @return {string}
 */
function homePath(_path) {
    return path.resolve(os.homedir(), _path);
}

/**
 * Возвращает путь к корню проекта
 * @return {string}
 */
function rootPath() {
    return PROJECT_PATH;
}

/**
 * Возвращает путь к корню проекта
 * @return {string}
 */
function projectPath() {
    return PROJECT_PATH;
}

/**
 * Возвращает путь относительно монорепозитория
 * @param {string} _path
 * @return {string}
 */
function resolvePath(_path) {
    return path.resolve(PROJECT_PATH, _path);
}

/**
 * Строит путь до пакета, по имени
 * @param {string} packageName
 * @return {string}
 */
function resolvePackage(packageName) {
    return resolvePath(`packages/${packageName}`);
}

/**
 * Строит путь до сервиса, по имени
 * @param {string} serviceName
 * @return {string}
 */
function resolveService(serviceName) {
    return resolvePath(`services/${serviceName}`);
}

/**
 * Строит путь сервера
 * @param {string} _path
 * @return {string}
 */
function resolveServer(_path) {
    return resolvePath(`server/${_path}`);
}

/**
 * Строит путь сервера
 * @param {string} _path
 * @return {string}
 */
function resolveConfig(_path) {
    return resolvePath(`_config/${_path}`);
}

/**
 * Возвращает путей к файлам в папке по расширению
 * @param {string} folder
 * @param {string} ext
 * @return {string[]}
 */
function resolveFiles(folder, ext) {
    const filter = new RegExp(`\\.${ext}$`);

    return fs
        .readdirSync(folder)
        .filter((file) => filter.test(file))
        .map((file) => path.resolve(folder, file));
}

/**
 * Возвращает первый существующий путь из списка
 * @param {string[]} paths
 * @return {string}
 */
function resolveExists(paths) {
    const existsPath = paths.find((_path) => fs.existsSync(_path));

    if (!existsPath) {
        throw new Error(`Not found exists path in ${paths.join('')}`);
    }

    return existsPath;
}

module.exports = {
    homePath,
    rootPath,
    projectPath,
    resolvePath,
    resolveFiles,
    resolveService,
    resolvePackage,
    resolveServer,
    resolveConfig,
    resolveExists,
};
