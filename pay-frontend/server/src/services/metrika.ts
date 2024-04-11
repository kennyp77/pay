import _ from 'lodash';

import BaseCore from '../core/base-core';
import { getCookieHeader } from '../helpers/cookie';

interface RequestData {
    url: string;
}

export default function (core: BaseCore, method: string, params: RequestData): Promise<any> {
    const options = {
        getRaw: true,
        headers: _.assign(_.pick(core.req.headers, ['origin', 'referer', 'user-agent']), {
            cookie: getCookieHeader(core.req),
        }),
    };

    return core.got(params.url, options);
}
