import BaseRouter, { ErrorCode, ErrorData } from '../../../../core/base-route';
import WebCore from '../../../../routes/helpers/web-core';
import { MimeTypes } from '../../../../typings/common';
import { jwtPayload } from '../helpers/jwt';
import { PickupOptionsRequest } from '../typings';

import { getPickupOptions } from './template';

class WebformRoute extends BaseRouter<WebCore> {
    constructor() {
        super('render-json', MimeTypes.json, WebCore);
    }

    async process(core: WebCore): Promise<void> {
        const payload = await jwtPayload<PickupOptionsRequest>(core.req.body);
        const data = await getPickupOptions(payload);

        return this.send(core, 200, { status: 'success', data });
    }

    processError(core: WebCore, code: ErrorCode, data: ErrorData): Promise<void> {
        return this.send(core, code, { status: 'fail', reasonCode: 'OTHER', reason: data.error });
    }
}

export default new WebformRoute().router;
