import { Core } from '@yandex-int/duffman';
import _ from 'lodash';

import BaseCore from '../core/base-core';

type ExtGotOptions = {
    method?: 'GET' | 'POST';
};

type ServiceOptions = {
    service: { url: string };
};

export default function (
    core: BaseCore,
    method: string,
    params: { purchaseToken: string },
    _options: Core.GotOptions & ExtGotOptions & ServiceOptions,
): Promise<any> {
    const { service } = _options;
    const options = _.merge(_.omit(_options, ['service']), {
        json: true,
        // eslint-disable-next-line @typescript-eslint/camelcase
        query: { purchase_token: params.purchaseToken },
    });

    // console.log(service.url + method, options, _options);

    return core.got(service.url + method, options);
}
