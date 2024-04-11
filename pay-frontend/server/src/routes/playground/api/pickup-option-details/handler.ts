import BaseRouter, { ErrorCode, ErrorData } from '../../../../core/base-route';
import WebCore from '../../../../routes/helpers/web-core';
import { MimeTypes } from '../../../../typings/common';
import { jwtPayload } from '../helpers/jwt';
import { PickupOptionDetailsRequest } from '../typings';

import { getPickupOptionDetails } from './template';

class WebformRoute extends BaseRouter<WebCore> {
    constructor() {
        super('render-json', MimeTypes.json, WebCore);
    }

    async process(core: WebCore): Promise<void> {
        const payload = await jwtPayload<PickupOptionDetailsRequest>(core.req.body);
        const data = await getPickupOptionDetails(payload);

        if (!data.pickupOption) {
            return this.send(core, 400, { status: 'fail', reasonCode: 'PICKUP_POINT_NOT_FOUND' });
        }

        return this.send(core, 200, { status: 'success', data });
    }

    processError(core: WebCore, code: ErrorCode, data: ErrorData): Promise<void> {
        return this.send(core, code, { status: 'fail', reasonCode: 'OTHER', reason: data.error });
    }
}

export default new WebformRoute().router;
