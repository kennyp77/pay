export const tryToCall = <T = void>(fn: () => T): T | void => {
    try {
        return fn();
    } catch (unused) {
        return undefined;
    }
};
