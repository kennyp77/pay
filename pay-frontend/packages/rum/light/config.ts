type Platform = 'touch' | 'desktop';
type Config = {
    url: string;
    env: string;
    initTimestamp: number;
    page: string;
    project: string;
    platform: Platform;
    version: string;
};

function getPlatform(): Platform {
    try {
        document.createEvent('TouchEvent');

        return 'touch';
    } catch (err) {
        return 'desktop';
    }
}

let URL = 'https://yandex.ru';
let ENV = 'production';
let INIT_TIMESTAMP = 0;
let PAGE = '';
let VERSION = '0.0.0';
// TODO: Убрать хардкод и подставлять проект при сборке
const PROJECT = 'pay';
const PLATFORM = getPlatform();

export function init(url: string, env: string, page: string, buildVersion: string): void {
    URL = url;
    ENV = env;
    PAGE = page;
    INIT_TIMESTAMP = Date.now();
    VERSION = buildVersion;
}

export function getConfig(): Config {
    return {
        url: URL,
        version: VERSION,
        env: ENV,
        initTimestamp: INIT_TIMESTAMP,
        page: PAGE,
        project: PROJECT,
        platform: PLATFORM,
    };
}

export function getCommonVars(): object {
    return {
        //версия
        '-version': VERSION,

        // окружение
        '-env': ENV,

        // принадлежность к сервису
        '-project': PROJECT,
        '-page': PAGE,

        // платформа
        '-platform': PLATFORM,
    };
}
