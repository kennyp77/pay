const baseConfig = require('@yandex-pay/config/jest/config');
const { resolveService } = require('@yandex-pay/config/paths');

const config = baseConfig({
    rootDir: resolveService('checkout'),
    testEnvironment: 'jsdom',
    testMatch: ['<rootDir>/**/__tests__/**/*.ts'],
    transformIgnorePatterns: ['node_modules'],
    moduleDirectories: ['node_modules', 'src'],
});

module.exports = config;
