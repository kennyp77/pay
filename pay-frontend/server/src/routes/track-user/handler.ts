import BaseRouter from '../../core/base-route';
import { getQuery, getRequestOrigin } from '../../helpers/request';
import { MimeTypes } from '../../typings/common';
import { counters } from '../helpers/metrika';
import WebCore from '../helpers/web-core';

class WebformRoute extends BaseRouter<WebCore> {
    constructor() {
        super('track-user', MimeTypes.plain, WebCore);
    }

    async process(core: WebCore): Promise<void> {
        const url = getQuery(core.req, 'target', getRequestOrigin(core.req));

        counters.track(core);

        return this.redirect(core, url);
    }
}

export default new WebformRoute().router;
