import config from '../../configs';
import { getUserEmail } from '../helpers/blackbox';
import { metrikaCheckoutId, metrikaSessionId } from '../helpers/metrika';
import WebCore from '../helpers/web-core';

type ClientConfig = Record<string, any>;

export const getClientConfig = (core: WebCore, extData: Record<string, any> = {}): ClientConfig => {
    return {
        env: core.config.env,
        version: core.config.version,
        uid: core.req.blackbox.uid,
        email: getUserEmail(core.req.blackbox),
        reqid: core.getRequestId(),
        csrfToken: core.req.csrfToken,
        metrikaId: core.config.metrika.consoleCounterId,
        metrikaSessionId: metrikaSessionId(core),
        metrikaCheckoutId: metrikaCheckoutId(core),
        services: config.clientServices,
        ...extData,
    };
};
