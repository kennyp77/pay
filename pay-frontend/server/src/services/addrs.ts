import { Core } from '@yandex-int/duffman';
import { GotOptions } from '@yandex-int/duffman/types/lib/core/got.types';

import BaseCore from '../core/base-core';
import { getServiceTicket } from '../helpers/tvm';

type ExtGotOptions = {
    service: { url: string };
};

type ServiceParams = {
    query: {
        text?: string;
        ll?: string;
        mode?: string;
        type?: string,
        geocoder_kind?: string,
        spn?: string,
        results?: string
    }
};

export default async function (
    core: BaseCore,
    method: string,
    params: ServiceParams,
    _options: Core.GotOptions & ExtGotOptions,
): Promise<Buffer> {
    const tvmServiceTicket = await getServiceTicket(core, 'addrs');

    const { service: { url } } = _options;
    const searchParams = {
        ms: 'pb',
        lang: 'ru',
        origin: 'pay-front',
        tvm: '1',
        ...params.query
    };

    const options: GotOptions & { encoding: string | null } = {
        encoding: null,
        query: searchParams,
        headers: {
            'x-ya-service-ticket': tvmServiceTicket.ticket,
            'x-request-id': core.requestId,
        },
    };

    return await core.got(
        url,
        options,
    );
}
