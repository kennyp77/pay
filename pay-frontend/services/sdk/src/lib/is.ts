export const isObject = (test: unknown): test is Object =>
    test !== null && typeof test === 'object';

export const isFunction = (test: unknown): test is Function => typeof test === 'function';

export const isElement = (test: unknown): test is HTMLElement =>
    isObject(test) && (test as HTMLElement).nodeType === 1;

export const isPromise = <T = unknown>(test: any): test is Promise<T> =>
    (isObject(test) || isFunction(test)) && isFunction(test.then);

export const hasProp = (prop: string, obj: any): boolean =>
    isObject(obj) && Object.prototype.hasOwnProperty.call(obj, prop);
