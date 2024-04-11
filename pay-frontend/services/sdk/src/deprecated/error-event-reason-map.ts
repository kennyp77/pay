import toSnakeCase from '@tinkoff/utils/string/snakeCaseName';
import { logInfo } from '@trust/rum/light/error-logger';

/**
 * Replacement for `ErrorEventReason` that returns uppercase version of the requested prop
 *
 * @returns {Proxy}
 */
export function deprecatedErrorEventReasonMap() {
    const mock = {};

    try {
        return new Proxy(mock, {
            get(obj, prop) {
                const val = String(prop);

                logInfo(`Usage of YaPay.ErrorEventReason.${val}`);
                console.warn('Yandex Pay SDK: YaPay.ErrorEventReason is deprecated.');

                return toSnakeCase(val).toUpperCase();
            },
        });
    } catch (ex) {
        logInfo('YaPay.ErrorEventReason fallback returned', ex);

        return mock;
    }
}
