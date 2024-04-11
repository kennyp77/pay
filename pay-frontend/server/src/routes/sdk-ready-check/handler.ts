import _ from 'lodash';

import BaseRouter from '../../core/base-route';
import { getRefererOrigin } from '../../helpers/request';
import { Req, MimeTypes } from '../../typings/common';
import { parseJson } from '../../utils/parse-json';
import { isAuth } from '../helpers/auth';
import { CHECK_OPTIONS_STUB } from '../helpers/payment-sheet';
import { getIsWebView } from '../helpers/platform';
import { isDisabled } from '../helpers/ready-to-pay';
import systemTemplates from '../helpers/system-templates';
import WebCore from '../helpers/web-core';

const TEMPLATE_NAME = 'sdk-ready-check';

const getCheckOptions = (req: Req): any => {
    const payloadJson = parseJson(req.body.payload);

    return _.get(payloadJson, 'checkOptions', CHECK_OPTIONS_STUB);
};

class WebformRoute extends BaseRouter<WebCore> {
    constructor() {
        super('sdk-ready-check', MimeTypes.html, WebCore);

        this.logPayload = true;
    }

    async process(core: WebCore): Promise<void> {
        const checkOptions = getCheckOptions(core.req);

        const html = this.render(core, systemTemplates.getTemplate(TEMPLATE_NAME), {
            version: core.config.version,
            env: core.config.env,
            reqid: core.getRequestId(),
            isAuth: isAuth(core, true),
            csrfToken: core.req.csrfToken,
            parentOrigin: getRefererOrigin(core.req),
            checkOptions,
            disabled: isDisabled(core, TEMPLATE_NAME, checkOptions),
            webview: getIsWebView(core.req),
        });

        return this.send(core, 200, html);
    }

    processError(core: WebCore): Promise<void> {
        const html = this.render(core, systemTemplates.getTemplate(TEMPLATE_NAME), {});

        return this.send(core, 200, html);
    }
}

export default new WebformRoute().router;
