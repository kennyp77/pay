const mergeDeep = require('@tinkoff/utils/object/mergeDeep');
const { rootPath, resolveConfig } = require('@yandex-pay/config/paths');

const baseConfig = {
    testEnvironment: 'node',
    // Корень, где все корневые библиотеки
    rootDir: rootPath(),
    transform: {
        '\\.(js|ts)$': resolveConfig('jest/transform/ts.js'),
        '\\.(jsx|tsx)$': resolveConfig('jest/transform/tsx.js'),
        '\\.s?ccs$': resolveConfig('jest/transform/css.js'),
        '\\.(jpg|png|gif|ico|svg|eot|woff2?|ttf)$': resolveConfig('jest/transform/file.js'),
    },
    setupFiles: [`${__dirname}/setup.js`],
    setupFilesAfterEnv: [`${__dirname}/setup-after-env.js`],
    globals: {
        __DEV__: false,
        __TEST__: true,
    },
};

module.exports = mergeDeep(baseConfig);
