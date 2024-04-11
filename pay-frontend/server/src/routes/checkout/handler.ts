import _ from 'lodash';

import BaseRouter, { ErrorCode, ErrorData } from '../../core/base-route';
import { MimeTypes } from '../../typings/common';
import { checkAuth } from '../helpers/auth';
import systemTemplates from '../helpers/system-templates';
import WebCore from '../helpers/web-core';

import { getClientConfig } from './template';

const TEMPLATE_NAME = 'checkout';

class WebformRoute extends BaseRouter<WebCore> {
    constructor() {
        super('checkout', MimeTypes.html, WebCore);

        this.logPayload = true;
    }

    async process(core: WebCore): Promise<void> {
        const [isAuth, passportUrl] = checkAuth(core);

        if (!isAuth) {
            return this.redirect(core, passportUrl);
        }

        const [experiment, { location: userLocation }] = await Promise.all([
            core.request('abt/experiments', {}),
            core.request('location/user-location', {}),
        ]);

        const html = this.render(
            core,
            systemTemplates.getTemplate(TEMPLATE_NAME),
            getClientConfig(core, { experiment }, { userLocation }),
        );

        return this.send(core, 200, html);
    }

    processError(core: WebCore, code: ErrorCode, data: ErrorData): Promise<void> {
        const template = systemTemplates.getTemplate(TEMPLATE_NAME);
        const html = template ? this.render(core, template, _.merge(data, { code })) : data;

        return this.send(core, code, html);
    }
}

export default new WebformRoute().router;
