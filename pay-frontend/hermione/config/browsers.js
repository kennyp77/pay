const desktopWindowSize = {
    width: 1280,
    height: 800,
};

const mobileWindowSize = {
    width: 375,
    height: 667,
};

const browsers = {
    // Desktop
    'chrome-desktop-80': {
        desiredCapabilities: {
            browserName: 'chrome',
            version: '80.0',
            acceptSslCerts: true,
            acceptInsecureCerts: true,
        },
        windowSize: desktopWindowSize,
        meta: { platform: 'desktop' },
    },

    'yandex-19.4': {
        desiredCapabilities: {
            browserName: 'yandex-browser',
            version: '19.4.0.1354',
            acceptSslCerts: true,
            acceptInsecureCerts: true,
        },
        windowSize: desktopWindowSize,
        meta: { platform: 'desktop' },
    },

    'firefox-71': {
        calibrate: false,
        desiredCapabilities: {
            browserName: 'firefox',
            version: '67.0',
            acceptSslCerts: true,
            acceptInsecureCerts: true,
        },
        windowSize: desktopWindowSize,
        meta: { platform: 'desktop' },
    },

    'opera-66': {
        desiredCapabilities: {
            browserName: 'opera',
            version: '66.0',
            acceptSslCerts: true,
            acceptInsecureCerts: true,
        },
        windowSize: desktopWindowSize,
        meta: { platform: 'desktop' },
    },

    'edge-16.1': {
        desiredCapabilities: {
            browserName: 'MicrosoftEdge',
            version: '16.1',
            acceptSslCerts: true,
            acceptInsecureCerts: true,
        },
        windowSize: desktopWindowSize,
        meta: { platform: 'desktop' },
    },

    'ie-11': {
        desiredCapabilities: {
            browserName: 'internet explorer',
            version: '11',
            acceptSslCerts: true,
            acceptInsecureCerts: true,
        },
        windowSize: desktopWindowSize,
        meta: { platform: 'desktop' },
    },

    // Mobile
    'chrome-mobile-80': {
        desiredCapabilities: {
            browserName: 'chrome',
            version: '80.0',
            acceptSslCerts: true,
            acceptInsecureCerts: true,
            chromeOptions: {
                mobileEmulation: {
                    deviceMetrics: mobileWindowSize,
                },
            },
        },
        windowSize: mobileWindowSize,
        meta: { platform: 'mobile' },
    },
};

const specification = {
    'chrome-desktop': browsers['chrome-desktop-80'],
    yandex: browsers['yandex-19.4'],
    opera: browsers['opera-66'],
    edge: browsers['edge-16.1'],
    'chrome-mobile': browsers['chrome-mobile-80'],
    firefox: browsers['firefox-71'],
    ie: browsers['ie-11'],
};

const desktopBrowsers = [
    'chrome-desktop',
    // 'yandex', позже
    // 'opera',
    // 'firefox',
    // 'edge',
    // 'ie',
];

const mobileBrowsers = [
    // 'chrome-mobile', позже
];

module.exports = {
    specification,
    desktop: desktopBrowsers,
    mobile: mobileBrowsers,

    all: [...desktopBrowsers, ...mobileBrowsers],
};
