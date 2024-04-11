import BaseRouter, { ErrorCode, ErrorData } from '../../core/base-route';
import { MimeTypes } from '../../typings/common';
import { isAuth } from '../helpers/auth';
import { getCoordinates } from '../helpers/coordinates';
import { renderJSON } from '../helpers/render-json';
import WebCore from '../helpers/web-core';

const BAD_REQUEST_MESSAGE = 'BAD REQUEST';
const FORBIDDEN_ERROR = 'FORBIDDEN';
const INTERNAL_ERROR_MESSAGE = 'INTERNAL SERVER ERROR';

class WebformRoute extends BaseRouter<WebCore> {
    constructor() {
        super('geocoder-find-house-nearby', MimeTypes.json, WebCore);
    }

    async process(core: WebCore): Promise<void> {
        if (!isAuth(core, true)) {
            const json = renderJSON(403, 'fail', FORBIDDEN_ERROR);

            return this.send(core, 403, json);
        }

        const coordinates = getCoordinates(core.req.query);

        if (!coordinates) {
            return this.send(core, 400, renderJSON(400, 'fail', BAD_REQUEST_MESSAGE));
        }

        const res = await core.request('geocoder/find-house-nearby', coordinates);
        const json = renderJSON(200, 'success', res);

        return this.send(core, 200, json);
    }

    processError(core: WebCore, code: ErrorCode, data: ErrorData): Promise<void> {
        const json = renderJSON(code, 'fail', INTERNAL_ERROR_MESSAGE);

        return this.send(core, code, json);
    }
}

export default new WebformRoute().router;
