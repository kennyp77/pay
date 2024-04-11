import { Core } from '@yandex-int/duffman';
import { GotOptions } from '@yandex-int/duffman/types/lib/core/got.types';

import BaseCore from '../core/base-core';
import { getServiceTicket } from '../helpers/tvm';

type ExtGotOptions = {
    service: { url: string };
};

type ServiceParams = {
    method: string;
    queryParams: Record<string, string>;
};

export default async function (
    core: BaseCore,
    method: string,
    params: ServiceParams,
    _options: Core.GotOptions & ExtGotOptions,
): Promise<Buffer> {
    const tvmServiceTicket = await getServiceTicket(core, 'blackbox');

    const {
        service: { url },
    } = _options;

    const options: GotOptions = {
        headers: {
            'x-ya-service-ticket': tvmServiceTicket.ticket,
            'x-request-id': core.requestId,
        },
        query: {
            method: params.method,
            ...params.queryParams,
        },
    };

    return await core.got(url + method, options);
}
