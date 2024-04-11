import _ from 'lodash';

import BaseRouter from '../../core/base-route';
import { getReferer } from '../../helpers/request';
import { Req, MimeTypes, PaymentSheet } from '../../typings/common';
import { parseJson } from '../../utils/parse-json';
import { isAuth } from '../helpers/auth';
import { counters } from '../helpers/metrika';
import { PAYMENT_SHEET_STUB } from '../helpers/payment-sheet';
import { getIsWebView } from '../helpers/platform';
import { isDisabled } from '../helpers/ready-to-pay';
import systemTemplates from '../helpers/system-templates';
import WebCore from '../helpers/web-core';

import { getClientConfig } from './template';

const TEMPLATE_NAME = 'sdk-init';

const getPaymentSheet = (req: Req): PaymentSheet => {
    const payloadJson = parseJson(req.body.payload);

    return _.get(payloadJson, 'paymentSheet', PAYMENT_SHEET_STUB) as PaymentSheet;
};

class WebformRoute extends BaseRouter<WebCore> {
    constructor() {
        super('sdk-init', MimeTypes.html, WebCore);

        this.logPayload = true;
    }

    async process(core: WebCore): Promise<void> {
        const paymentSheet = getPaymentSheet(core.req);

        counters.initMeta(core, {
            isAuth: isAuth(core, true),
            pspUrl: getReferer(core.req),
        });

        const experiment = await core.request('abt/experiments', {});

        const html = this.render(
            core,
            systemTemplates.getTemplate(TEMPLATE_NAME),
            getClientConfig(core, {
                paymentSheet,
                experiment,
                disabled: isDisabled(core, TEMPLATE_NAME, paymentSheet),
                webview: getIsWebView(core.req),
            }),
        );

        return this.send(core, 200, html);
    }

    processError(core: WebCore): Promise<void> {
        const html = this.render(
            core,
            systemTemplates.getTemplate(TEMPLATE_NAME),
            getClientConfig(core),
        );

        return this.send(core, 200, html);
    }
}

export default new WebformRoute().router;
