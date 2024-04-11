import BaseRouter, { ErrorCode, ErrorData } from '../../core/base-route';
import { MimeTypes } from '../../typings/common';
import { isAuth } from '../helpers/auth';
import { renderJSON } from '../helpers/render-json';
import WebCore from '../helpers/web-core';

const FORBIDDEN_ERROR = 'FORBIDDEN';
const INTERNAL_ERROR_MESSAGE = 'INTERNAL SERVER ERROR';

class WebformRoute extends BaseRouter<WebCore> {
    constructor() {
        super('decrease-session', MimeTypes.json, WebCore);
    }

    async process(core: WebCore): Promise<void> {
        if (!isAuth(core, true)) {
            const json = renderJSON(403, 'fail', FORBIDDEN_ERROR);

            return this.send(core, 403, json);
        }

        const res = await core.request('blackbox/decreaseSession', {});
        const json = renderJSON(200, 'success', res);

        const headers = {};

        if (!json.data.error) {
            // @ts-ignore
            headers[
                'Set-Cookie'
            ] = `Session_id=${json.data.sessionId}; Domain=.yandex.ru; Secure; HttpOnly; Max-Age=9000000; Path=/`;
        }

        // NB: ТОЛЬКО ДЛЯ ТЕСТИРОВАНИЯ
        return this.send(core, 200, json, headers);
    }

    processError(core: WebCore, code: ErrorCode, data: ErrorData): Promise<void> {
        const json = renderJSON(code, 'fail', INTERNAL_ERROR_MESSAGE);

        return this.send(core, code, json);
    }
}

export default new WebformRoute().router;
