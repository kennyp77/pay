import { URL, URLSearchParams } from 'url';

import config from '../configs';

type MetrikaUrl = string;

interface RequestData {
    params?: Record<string, any>;
    goal?: string;
    ymUid?: string;
    viewUrl?: string;
}

const { counterId, host } = config.metrika;
const { hostname: goalHost } = new URL(config.metrika.pageUrl);

// TODO: Вынести в @trust/metrika-api
//       Учесть особенность установки пакетов на сервер (симлинки не работают)
export function createMetrikaUrl(data: RequestData): MetrikaUrl {
    const now = (Date.now() * 0.001) | 0;
    const rnd = (Math.random() * 1073741824) | 0;
    const ymUid = data.ymUid || `${now}${rnd}`;

    let pageUrl = data.viewUrl || config.metrika.pageUrl;

    let pageRef = '';
    let siteInfo = '';
    let browserInfo: string[] = [];

    if (data.params) {
        siteInfo = JSON.stringify(data.params);
        browserInfo = ['pa:1', 'ar:1'];
    }

    if (data.goal) {
        pageRef = pageUrl;
        pageUrl = `goal://${goalHost}/${data.goal}`;
    }

    if (data.viewUrl) {
        browserInfo = ['pv:1'];
    }

    browserInfo = [...browserInfo, `et:${now}`, `st:${now}`, `rn:${rnd}`, `u:${ymUid}`, 't:'];

    const uri = `/watch/${counterId}/1`;
    const query = {
        charset: 'utf-8',
        'page-url': pageUrl,
        'page-ref': pageRef,
        'site-info': siteInfo,
        'browser-info': browserInfo.join(':'),
    };

    const sp = new URLSearchParams(query);

    return new URL(`${uri}?${sp.toString()}`, host).toString();
}
