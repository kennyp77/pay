const enc = (v: string): string => encodeURIComponent(v);

type CounterId = number | string;
type CounterUrl = string;

interface InitParams {
    pageUrl: string;
    hostname: string;
    ymUid?: string;
}

interface SendData {
    params?: Record<string, any>;
    goal?: string;
    viewUrl?: string;
}

interface SendOptions {
    skipSend?: boolean;
}

interface SendCallback {
    (error?: string): void;
}

let COUNTER_URL = 'https://mc.yandex.ru';
let COUNTER_ID = '';
let COUNTER_PARAMS: InitParams = { pageUrl: '', hostname: '' };
let EXPERIMENTS = '';

function _send(
    data: SendData,
    options: SendOptions = {},
    callback: SendCallback = () => undefined,
): CounterUrl {
    if (!COUNTER_ID) {
        callback('no-counter');

        return '';
    }

    const now = (Date.now() * 0.001) | 0;
    const rnd = (Math.random() * 1073741824) | 0;
    const ymUid = COUNTER_PARAMS.ymUid || `${now}${rnd}`;

    let pageUrl = data.viewUrl || COUNTER_PARAMS.pageUrl;
    let pageRef = '';
    let siteInfo = '';
    let browserInfo: string[] = [];

    if (data.params) {
        siteInfo = JSON.stringify(data.params);
        browserInfo = ['pa:1', 'ar:1'];
    }

    if (data.goal) {
        pageRef = pageUrl;
        pageUrl = `goal://${COUNTER_PARAMS.hostname}/${data.goal}`;
    }

    if (data.viewUrl) {
        browserInfo = ['pv:1'];
    }

    browserInfo = [...browserInfo, `et:${now}`, `st:${now}`, `rn:${rnd}`, `u:${ymUid}`, 't:'];

    const url = [
        `${COUNTER_URL}/watch/${COUNTER_ID}/1`,
        '?charset=utf-8',
        `&page-url=${enc(pageUrl)}`,
        `&exp=${enc(EXPERIMENTS)}`,
        `&page-ref=${enc(pageRef)}`,
        `&site-info=${enc(siteInfo)}`,
        `&browser-info=${enc(browserInfo.join(':'))}`,
    ].join('');

    if (options.skipSend) {
        callback();

        return url;
    }

    const img = new Image();
    img.onload = () => callback();
    img.onerror = () => callback('onerror');
    img.src = url;

    return url;
}

export function init(counterId: CounterId, params: InitParams, counterUrl?: string): void {
    COUNTER_ID = `${counterId}`;
    COUNTER_PARAMS = params;

    if (counterUrl) {
        COUNTER_URL = counterUrl;
    }
}

export function setExperiments(experiments: string): void {
    EXPERIMENTS = experiments;
}

export function view(
    viewUrl: SendData['viewUrl'],
    options?: SendOptions,
    callback?: SendCallback,
): CounterUrl {
    return _send({ viewUrl }, options, callback);
}

export function count(
    params: SendData['params'],
    options?: SendOptions,
    callback?: SendCallback,
): CounterUrl {
    return _send({ params }, options, callback);
}

export function goal(
    id: SendData['goal'],
    params?: SendData['params'],
    options?: SendOptions,
    callback?: SendCallback,
): CounterUrl {
    return _send({ goal: id, params }, options, callback);
}
