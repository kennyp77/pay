import memoizeOnce from '@tinkoff/utils/function/memoize/one';
import { ServerApiModule } from '@yandex-pay/pay-common';

import { IS_CHECKOUT_SERVER } from '../config';

import { CheckoutClientApi } from './intercom';

export class CheckoutApi {
    static getInstance = memoizeOnce((): CheckoutClientApi => {
        if (IS_CHECKOUT_SERVER) {
            /* @ts-ignore */
            return ServerApiModule.getInstance();
        }

        return CheckoutClientApi.getInstance();
    });
}
