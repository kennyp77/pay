const baseConfig = require('@yandex-pay/config/jest/config');
const { resolveService } = require('@yandex-pay/config/paths');

const config = baseConfig({
    verbose: true,
    rootDir: resolveService('playground'),
    testEnvironment: 'jsdom',
    testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
    transformIgnorePatterns: ['node_modules'],
    moduleDirectories: ['node_modules', 'src'],
});

module.exports = config;
