import { Csrf } from '@yandex-int/csrf';
import { Core, express } from '@yandex-int/duffman';
import _ from 'lodash';

import BaseCore from '../core/base-core';
import { getEnv } from '../utils';

type ExtGotOptions = {
    method?: 'GET' | 'POST';
    body?: Record<string, any>;
};

type ServiceOptions = {
    service: { url: string };
};

const csrf = new Csrf({ key: getEnv('CSRF_KEY') });

const getCsrfToken = (req: express.Request): string =>
    csrf.generateToken({
        yandexuid: req.cookies && req.cookies.yandexuid,
        uid: '0',
    });

export default function (
    core: BaseCore,
    uri: string,
    params: any,
    _options: Core.GotOptions & ExtGotOptions & ServiceOptions,
): Promise<any> {
    const { service } = _options;
    const options = _.merge(_.omit(_options, ['service']), { json: true });

    options.headers = options.headers || {};
    // NB: Бэку Пея нужны куки пользователя для получения карт пользователя
    options.headers.Cookie = core.req.headers.cookie || '';

    if (options.method === 'POST') {
        options.headers['X-Csrf-Token'] = getCsrfToken(core.req);

        if (params) {
            options.body = params;
        }
    }

    return core.got(service.url + uri, options);
}
