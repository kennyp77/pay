const baseConfig = require('@yandex-pay/config/jest/config');

module.exports = baseConfig({
    verbose: true,
    rootDir: __dirname,
    testEnvironment: 'jsdom',
    testMatch: ['<rootDir>/**/__tests__/**/*.ts'],
});
