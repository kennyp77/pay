import { Core } from '@yandex-int/duffman';
import btoa from 'btoa';
import _ from 'lodash';

import BaseCore from '../core/base-core';

type ExtGotOptions = {
    service: { url: string };
};

type UAASParams = {
    appInfo: Record<string, any>;
    headers: Record<string, any>;
};

export default function (
    core: BaseCore,
    method: string,
    params: UAASParams,
    _options: Core.GotOptions & ExtGotOptions,
): Promise<Record<string, any>> {
    const { req } = core;
    const { service } = _options;

    const headers = _.assign(
        {
            Cookie: req.get('cookie'),
            'User-Agent': core.headers['user-agent'],
            'X-Forwarded-For-Y': core.headers['x-real-ip'] || req.ip,
            'X-Yandex-ICookie': core.headers['x-yandex-icookie'],
            'X-Region-City-Id': core.headers['x-region-city-id'],
            'X-IP-Properties': core.headers['x-ip-properties'],
            'X-Yandex-RandomUID': _.get(req.cookies, ['yandexuid'], '0'),
            'X-Yandex-AppInfo': btoa(JSON.stringify(params.appInfo)),
        },
        params.headers,
    );

    const hasYandexuid = headers.cookie && headers.cookie.includes('yandexuid=');
    if (!hasYandexuid && req.cookies.yandexuid) {
        headers.cookie = `yandexuid=${req.cookies.yandexuid}${
            req.headers.cookie ? '; ' + req.headers.cookie : ''
        }`;
    }

    const options = {
        getHeaders: true,
        getRaw: true,
        headers,
    };

    return core.got(service.url, options);
}
