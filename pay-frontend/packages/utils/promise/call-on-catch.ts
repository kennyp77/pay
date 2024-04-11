type AnyFn = (...args: any[]) => any;

export function callOnCatch<T extends AnyFn>(cb: AnyFn, funcP: T): T {
    return ((...args) =>
        funcP(...args).catch((err: any) => {
            cb(err);

            return Promise.reject(err);
        })) as T;
}
