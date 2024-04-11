import config from '../../../configs';
import BaseRouter from '../../../core/base-route';
import { MimeTypes } from '../../../typings/common';
import systemTemplates from '../../helpers/system-templates';
import WebCore from '../../helpers/web-core';

const TEMPLATE_NAME = 'playground';

function getRenderData(core: WebCore) {
    return {
        version: core.config.version,
        env: core.config.env,
        csrfToken: core.req.csrfToken,
        devUsername: config.playground.devUsername,
    };
}

class WebformRoute extends BaseRouter<WebCore> {
    constructor() {
        super('playground', MimeTypes.html, WebCore);

        this.logPayload = false;
    }

    async process(core: WebCore): Promise<void> {
        const html = this.render(
            core,
            systemTemplates.getTemplate(TEMPLATE_NAME),
            getRenderData(core),
        );

        return this.send(core, 200, html);
    }

    processError(core: WebCore): Promise<void> {
        const html = this.render(
            core,
            systemTemplates.getTemplate(TEMPLATE_NAME),
            getRenderData(core),
        );

        return this.send(core, 200, html);
    }
}

export default new WebformRoute().router;
