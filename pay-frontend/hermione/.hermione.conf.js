const browsers = require('./config/browsers');
const getCommands = require('./helpers/get-commands');
const tusClientConfig = require('./config/tus-client-conf.js');

module.exports = {
    gridUrl: 'http://selenium:selenium@sg.yandex-team.ru:4444/wd/hub',
    baseUrl: 'https://test.pay.yandex.ru/demo',

    screenshotPath: './tmp/screenshots',
    screenshotsDir: './screenshots',

    httpTimeout: 30000,
    sessionRequestTimeout: 60000,
    sessionQuitTimeout: 5000,

    waitTimeout: 15000,
    screenshotOnRejectTimeout: 5000,

    testsPerSession: 10,
    sessionsPerBrowser: 1,
    retry: 1,

    calibrate: true,
    compositeImage: true,
    antialiasingTolerance: 4,

    browsers: browsers.specification,

    sets: {
        default: {
            files: ['tests/bl/pay-form-tests/*.js', 'tests/acceptance/*.js'],
            browsers: browsers.all,
        },
    },

    prepareBrowser: getCommands,

    system: {
        // При Infinity тормозит
        parallelLimit: 10,
    },

    plugins: {
        'html-reporter/hermione': {
            enabled: true,
            path: 'tmp/hermione-html-report',
            defaultView: 'failed',
        },
        'hermione-ignore': {
            globalIgnore: {
                // Делаем таймер прозрачным `opacity: 0`.
                invisibleElements: ['.countdown__time', '[data-label="countdown"]'],
            },
        },
        '@yandex-int/hermione-debug': {
            enabled: false,
        },
        '@yandex-int/hermione-auth-commands': tusClientConfig,
        'teamcity-reporter': {
            enabled: Boolean(process.env.TEAMCITY_VERSION),
        },
    },
};
