import { timeRace } from '@trust/utils/promise/time-race';
import { MessageType } from '@yandex-pay/sdk/src/typings';

import { FormConnection } from '../lib/intercom';

const PING_TIMEOUT = 1000;

export const pingOpener = (): Promise<void> =>
    new Promise((resolve, reject) => {
        const adapter = FormConnection.getInstance();

        const pingPromise = new Promise((resolvePing) => {
            adapter.on(MessageType.Ping, resolvePing);
        });

        const timeoutError = new Error('Ping error');

        timeRace(pingPromise, PING_TIMEOUT, timeoutError)
            .then(() => resolve())
            .catch(reject);

        adapter.ping();
    });
