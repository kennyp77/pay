import _ from 'lodash';

import BaseRouter from '../../core/base-route';
import { Req, MimeTypes, PaymentSheet } from '../../typings/common';
import { parseJson } from '../../utils/parse-json';
import { checkAuth } from '../helpers/auth';
import { PAYMENT_SHEET_STUB } from '../helpers/payment-sheet';
import systemTemplates from '../helpers/system-templates';
import WebCore from '../helpers/web-core';

import { getClientConfig } from './template';

const TEMPLATE_NAME = 'checkout-mock';

const getPaymentSheet = (req: Req): PaymentSheet => {
    const payloadJson = parseJson(req.body.payload);

    return _.get(payloadJson, 'paymentSheet', PAYMENT_SHEET_STUB) as PaymentSheet;
};

class WebformRoute extends BaseRouter<WebCore> {
    constructor() {
        super('checkout-mock', MimeTypes.html, WebCore);

        this.logPayload = true;
    }

    async process(core: WebCore): Promise<void> {
        const [isAuth, passportUrl] = checkAuth(core, { log: false });

        if (!isAuth) {
            return this.redirect(core, passportUrl);
        }

        const paymentSheet = getPaymentSheet(core.req);

        const html = this.render(
            core,
            systemTemplates.getTemplate(TEMPLATE_NAME),
            getClientConfig(core, {
                paymentSheet,
                experiment: {},
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
