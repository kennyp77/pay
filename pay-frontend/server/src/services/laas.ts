import { Core } from '@yandex-int/duffman';
import { GotOptions } from '@yandex-int/duffman/types/lib/core/got.types';
import _ from 'lodash';

import config from '../configs';
import BaseCore from '../core/base-core';

type ExtGotOptions = {
    service: { url: string };
};

export default function (
    core: BaseCore,
    uri: string,
    params: any,
    _options: Core.GotOptions & ExtGotOptions,
): Promise<Record<string, any>> {
    const { req } = core;
    const { service } = _options;

    const headers = _.assign({
        Cookie: req.get('cookie'),
        'User-Agent': core.headers['user-agent'],
        'X-Forwarded-For-Y': core.headers['x-real-ip'] || req.ip,
    });

    const options: GotOptions = {
        headers,
        query: {
            service: config.laas.service,
        },
        json: true,
    };

    return core.got(service.url + uri, options);
}
