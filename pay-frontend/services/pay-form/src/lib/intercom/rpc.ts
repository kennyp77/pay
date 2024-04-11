import memoizeOnce from '@tinkoff/utils/function/memoize/one';
import { timeRace } from '@trust/utils/promise/time-race';
import { InitPaymentSheet, MessageType } from '@yandex-pay/sdk/src/typings';

import { FormConnection } from './connection';

export class PayClientApi {
    static getInstance = memoizeOnce((): PayClientApi => {
        return new PayClientApi();
    });

    waitSheet(waitTimeout: number) {
        const conn = FormConnection.getInstance();

        const error = new Error('The payment sheet was not provided');
        const sheetP = new Promise<InitPaymentSheet>((resolve, reject) => {
            conn.once(MessageType.Payment, (data) => (data ? resolve(data.sheet) : reject(error)));
        });

        return timeRace(sheetP, waitTimeout, error);
    }
}
