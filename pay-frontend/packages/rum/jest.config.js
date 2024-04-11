const config = require('@yandex-pay/config/jest/config');

module.exports = config(__dirname, {
    testEnvironment: 'jsdom',
    testMatch: ['**/__tests__/**/*.ts'],
});
