import url from 'url';

import _ from 'lodash';

import BaseRouter, { ErrorCode, ErrorData } from '../../core/base-route';
import { getRequestBaseUrl } from '../../helpers/request';
import encryptCredentials from '../../models/console-webapi/encrypt-credentials';
import { MimeTypes, Req } from '../../typings/common';
import { parseJson } from '../../utils/parse-json';
import { checkAuth } from '../helpers/auth';
import systemTemplates from '../helpers/system-templates';
import WebCore from '../helpers/web-core';

import { getClientConfig } from './template';

const TEMPLATE_NAME = 'console-registration';

const getPayload = (req: Req): string => {
    return parseJson<string>(req.body.payload, '');
};

class WebformRoute extends BaseRouter<WebCore> {
    constructor() {
        super('console-registration', MimeTypes.html, WebCore);

        this.logPayload = true;
    }

    async process(core: WebCore): Promise<void> {
        const payload = getPayload(core.req);
        const { query } = core.req;
        let newOriginalUrl: string | undefined = undefined;

        let creds = '';

        if (payload) {
            try {
                creds = await encryptCredentials(
                    { psp_external_id: query.gateway, creds: payload },
                    core,
                );
            } catch (error) {
                core.logger.error('Encrypt Credentials error', {
                    message: error.message || error,
                    stack: error.stack,
                });
            }

            newOriginalUrl = url.format({
                pathname: getRequestBaseUrl(core.req),
                query: { ...query, creds },
            });

            // Если в текущем запросе мы получили креды из post, редиректим, вставляя зашифрованные креды в url
            if (creds && !query.creds) {
                return this.redirect(core, newOriginalUrl);
            }
        }

        const [isAuth, passportUrl] = checkAuth(core, undefined, newOriginalUrl);

        if (!isAuth) {
            return this.redirect(core, passportUrl);
        }

        const experiment = await core.request('abt/experiments', {});

        const html = this.render(
            core,
            systemTemplates.getTemplate(TEMPLATE_NAME),
            getClientConfig(core, {
                experiment,
            }),
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
