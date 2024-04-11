import { Core } from '@yandex-int/duffman';
import _ from 'lodash';

import BaseCore from '../core/base-core';

type ExtGotOptions = {
    method?: 'GET' | 'POST';
    body?: Record<string, any>;
};

type ServiceOptions = {
    service: { url: string };
};

export default function (
    core: BaseCore,
    uri: string,
    params: any,
    _options: Core.GotOptions & ExtGotOptions & ServiceOptions,
): Promise<any> {
    const { service } = _options;
    const options = _.merge(_.omit(_options, ['service']), { json: true });
    if (params) {
        options.body = params;
    }

    return core.got(service.url + uri, options);
}
