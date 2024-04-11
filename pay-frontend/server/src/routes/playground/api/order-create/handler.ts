import BaseRouter from '../../../../core/base-route';
import WebCore from '../../../../routes/helpers/web-core';
import { MimeTypes } from '../../../../typings/common';
import { jwtPayload } from '../helpers/jwt';
import { generateString } from '../helpers/string';
import { CreateOrderRequest } from '../typings';

const createOrder = (payload: CreateOrderRequest) => {
    return {
        orderId: `order--${payload.cart.cartId}--${generateString(8)}`,
    };
};

class WebformRoute extends BaseRouter<WebCore> {
    constructor() {
        super('render-json', MimeTypes.json, WebCore);
    }

    async process(core: WebCore): Promise<void> {
        const payload = await jwtPayload<CreateOrderRequest>(core.req.body);
        const data = createOrder(payload);

        return this.send(core, 200, {
            status: 'success',
            data,
        });
    }
}

export default new WebformRoute().router;
