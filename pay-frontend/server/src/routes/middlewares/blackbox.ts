import { express } from '@yandex-int/duffman';
import expressBlackbox from '@yandex-int/express-blackbox';

import config from '../../configs';
import { ExpressHandler } from '../../typings/common';

interface BlackboxMiddlewareOptions {
    username?: boolean;
    phonesMeta?: boolean;
}

export default (options: BlackboxMiddlewareOptions = {}): ExpressHandler => {
    let phones;
    const attributes: Record<string, string> = {
        login: '1008',
        email: '14',
    };

    if (options.username) {
        attributes.firstName = '27';
        attributes.lastName = '28';
    }

    if (options.phonesMeta) {
        phones = {
            kind: 'bound' as const,
            attributes: {
                is_confirmed: '105' as const,
                is_bound: '106' as const,
                is_default: '107' as const,
                is_secured: '108' as const,
            },
        };
    }

    return expressBlackbox({
        oauth: true,
        api: config.services.blackbox.host,
        attributes,
        phones,
        emails: 'getdefault',
        getServiceTicket: (_req: express.Request) =>
            _req.tvm && _req.tvm['pay-front'].tickets.blackbox.ticket,
        aliases: 'all',
    });
};
