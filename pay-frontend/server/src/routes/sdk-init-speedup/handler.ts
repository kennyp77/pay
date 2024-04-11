import BaseRouter, { ErrorCode, ErrorData } from '../../core/base-route';
import { getRefererOrigin } from '../../helpers/request';
import { MimeTypes } from '../../typings/common';
import systemTemplates from '../helpers/system-templates';
import WebCore from '../helpers/web-core';

const TEMPLATE_NAME = 'sdk-init-speedup';

class WebformRoute extends BaseRouter<WebCore> {
    constructor() {
        super('sdk-init-speedup', MimeTypes.html, WebCore);

        this.logPayload = true;
    }

    async process(core: WebCore): Promise<void> {
        const { status } = core.req.bunker;

        const html = this.render(core, systemTemplates.getTemplate(TEMPLATE_NAME), {
            env: core.config.env,
            parentOrigin: getRefererOrigin(core.req),
            experiment: '{}',
            readyToPay: status.active,
        });

        return this.send(core, 200, html);
    }

    processError(core: WebCore, code: ErrorCode, data: ErrorData): Promise<void> {
        const html = this.render(core, systemTemplates.getTemplate(TEMPLATE_NAME), {
            env: core.config.env,
            parentOrigin: getRefererOrigin(core.req),
            experiment: '{}',
            readyToPay: false,
        });

        return this.send(core, 200, html);
    }
}

export default new WebformRoute().router;
