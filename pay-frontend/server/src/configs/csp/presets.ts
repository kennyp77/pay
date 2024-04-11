const SELF = "'self'";

const TRUST = ['https://trust.yandex.ru'];
const TRUST_TEST = ['https://trust-test.yandex.ru'];
const CONSOLE = ['https://console.pay.yandex.ru'];
const CONSOLE_TEST = ['https://test.console.pay.yandex.ru'];

const YASTATIC = ['https://yastatic.net'];

const YAMAPS = ['https://api-maps.yandex.ru/', 'https://core-renderer-tiles.maps.yandex.net'];

export const self = {
    'script-src': [SELF],
    'style-src': [SELF],
    'font-src': [SELF],
    'img-src': [SELF],
    'connect-src': [SELF],
};

export const selfDev = {
    'script-src': ['*', SELF, "'unsafe-inline'", "'unsafe-eval'"],
    'connect-src': ['*'],
};

export const trust = {
    'frame-src': TRUST,
    'connect-src': TRUST,
};

export const trustTest = {
    'frame-src': TRUST_TEST,
    'connect-src': TRUST_TEST,
};

export const trustDev = {
    'frame-src': ['https://trust.local.yandex.ru:3000/'],
};

export const bnpl = {
    prod: {
        'frame-src': ['https://split.yandex.ru', 'https://sandbox.split.yandex.ru'],
    },
    test: {
        'frame-src': ['https://test.bnpl.yandex.ru'],
    },
    dev: {
        'frame-src': ['https://test.bnpl.yandex.ru'],
    },
};

export const auth3ds = {
    prod: {
        'frame-src': ['https://pay.yandex.ru', 'https://sandbox.pay.yandex.ru'],
    },
    test: {
        'frame-src': ['https://test.pay.yandex.ru'],
    },
    dev: {
        'frame-src': ['https://test.pay.yandex.ru'],
    },
};

export const cspUrl = {
    'connect-src': ['https://csp.yandex.net/csp'],
};

export const rum = {
    'connect-src': ['https://yandex.ru'],
};

export const rumDev = {
    'connect-src': ['https://api.stat.yandex-team.ru'],
};

export const metrika = {
    'script-src': ['https://mc.yandex.ru'],
    'img-src': ['https://mc.admetrica.ru', 'https://mc.yandex.ru'],
    'connect-src': ['https://mc.admetrica.ru', 'https://mc.yandex.ru'],
};

export const geo = {
    'connect-src': ['https://suggest-maps.yandex.ru'],
};

export const geoTest = {
    'connect-src': ['https://suggest-maps-test.n.yandex-team.ru'],
};

export const yastatic = {
    'script-src': YASTATIC,
    'style-src': YASTATIC,
    'font-src': YASTATIC,
    'img-src': YASTATIC,
};

export const yamaps = {
    'script-src': YAMAPS,
    'img-src': YAMAPS,
};

export const passport = {
    'img-src': ['https://avatars.mds.yandex.net', 'https://avatars.mdst.yandex.net'],
    'connect-src': ['https://api.passport.yandex.ru', 'https://api.passport-test.yandex.ru'],
    'object-src': ['https://avatars.mds.yandex.net'],
};

export const consoleApiTest = {
    'connect-src': CONSOLE_TEST,
};

export const consoleApi = {
    'connect-src': CONSOLE,
};

export const getFramesSrc = (presets: Record<string, string[]>[]): string[] =>
    presets.reduce((prev, curr) => {
        if (curr['frame-src']) {
            prev.push(...curr['frame-src']);
        }

        return prev;
    }, []);
