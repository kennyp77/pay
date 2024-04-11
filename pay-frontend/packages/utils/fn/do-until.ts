import { delayCall } from '@yandex-pay/sdk/src/lib/tools';

type DoResult = { continue?: boolean };

export const doUntil = (
    delay: number,
    callbackFn: Sys.CallbackFn0<DoResult> | Sys.CallbackFn0<Promise<DoResult>>,
): Promise<void> => {
    let delayTimer: NodeJS.Timeout;

    return new Promise((resolve, reject) => {
        const checkFn = async () => {
            try {
                const status = await callbackFn();

                if (status && status.continue) {
                    delayTimer = delayCall(checkFn, delay);
                } else {
                    resolve();
                }
            } catch (err) {
                reject(err);
            }
        };

        checkFn();
    });
};
