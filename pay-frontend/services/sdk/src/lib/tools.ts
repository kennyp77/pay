export const isObject = (val: any): boolean => val !== null && typeof val === 'object';

export const isElement = (val: any): boolean => isObject(val) && val.nodeType === 1;

export const delayCall = (cb: Sys.CallbackFn0, delay = 0): NodeJS.Timeout =>
    setTimeout(cb, delay ?? 1000);

export const waitUntil = (
    conditionFn: Sys.CallbackFn0<boolean>,
    callbackFn: Sys.CallbackFn0,
    delay = 0,
): Sys.CallbackFn0 => {
    let delayTimer: NodeJS.Timeout;
    const check = () => {
        if (conditionFn()) {
            return callbackFn();
        }
        delayTimer = delayCall(check, delay);
    };
    check();

    return (): void => {
        if (delayTimer) {
            clearTimeout(delayTimer);
        }
    };
};
