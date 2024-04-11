import { delayCall } from './tools';

type WatcherCb = Sys.CallbackFn2<'undefined' | 'timer' | void, string | void>;
type WatcherTimeout = number;

export function pageFocusWatcher(callback: WatcherCb, timeout: WatcherTimeout = 0) {
    const start = Date.now();

    if (!document.visibilityState) {
        return callback('undefined');
    }

    const check = (): void => {
        const state = document.visibilityState;

        if (state === 'visible') {
            callback();
        } else if (timeout > 0 && Date.now() - start > timeout) {
            callback('timer', state);
        } else {
            delayCall(check, Math.min(timeout, 500));
        }
    };

    delayCall(check, 0);
}
