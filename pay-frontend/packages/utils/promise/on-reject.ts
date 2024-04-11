type AnyFn = (...args: any[]) => any;

export function onReject<T extends AnyFn>(cb: AnyFn, funcP: T): T {
    return ((...args) => funcP(...args).catch((err: any) => cb(err))) as T;
}
