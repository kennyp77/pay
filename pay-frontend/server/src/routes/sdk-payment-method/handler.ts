import _ from 'lodash';

import BaseRouter from '../../core/base-route';
import { isTest, isDev } from '../../helpers/common';
import { MimeTypes, AbtExps } from '../../typings/common';
import { parseJson } from '../../utils/parse-json';
import { getButtonView } from '../helpers/payment-sheet';
import systemTemplates from '../helpers/system-templates';
import WebCore from '../helpers/web-core';

import { getClientConfig } from './template';

const TEMPLATE_NAME = 'sdk-payment-method';

function updateTestExps(experiment: AbtExps, paymentSheet: any) {
    const rawMetadata = _.get(paymentSheet, 'metadata', null);

    if (!experiment || !rawMetadata) {
        return;
    }

    const meta = parseJson(rawMetadata, {}) as any;

    if (meta.newButton === 'new-button') {
        experiment.flags['new-button'] = true;
    }

    if (meta.newButton === 'new-button--show-empty') {
        experiment.flags['new-button'] = true;
        experiment.flags['new-button--show-empty'] = true;
    }

    if (meta.newButton === 'new-button--logo-as-text') {
        experiment.flags['new-button'] = true;
        experiment.flags['new-button--logo-as-text'] = true;
    }
}

class WebformRoute extends BaseRouter<WebCore> {
    constructor() {
        super('sdk-payment-method', MimeTypes.html, WebCore);

        this.logPayload = true;
    }

    async process(core: WebCore): Promise<void> {
        const payloadJson = parseJson(_.get(core.req.body, 'payload', null), {});

        const paymentSheet = _.get(payloadJson, 'paymentSheet', null);
        const buttonOptions = _.get(payloadJson, 'buttonOptions', null);
        const buttonStyles = _.get(payloadJson, 'buttonStyles', null);
        const buttonView = getButtonView(paymentSheet, core);

        const experiment = await core.request('abt/experiments', {});

        let testingFlags = null;
        if (isTest || isDev) {
            updateTestExps(experiment, paymentSheet);
            testingFlags = parseJson(paymentSheet.metadata, null);
        }

        const html = this.render(
            core,
            systemTemplates.getTemplate(TEMPLATE_NAME),
            getClientConfig(
                core,
                {
                    paymentSheet,
                    buttonOptions,
                    buttonStyles,
                    buttonView,
                    experiment,
                },
                testingFlags,
            ),
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
