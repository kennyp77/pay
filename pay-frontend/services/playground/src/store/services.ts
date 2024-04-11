import clone from '@tinkoff/utils/clone';
import pathSet from '@tinkoff/utils/object/pathSet';
import capitalize from '@tinkoff/utils/string/capitalize';
import toString from '@tinkoff/utils/string/toString';
import { createService, ServiceCallback } from '@yandex-pay/react-services';
import ms from 'ms';
import { O } from 'ts-toolbelt';

import { State, LogRecord, captionLogRecord } from 'store/state';

const IGNORE_VERSION_PATH = ['log'];

const set = function <P extends O.Paths<State>>(path: P): ServiceCallback<State> {
    const fn: ServiceCallback<State, [O.Path<State, P>]> = function (store, value) {
        let writableState = clone(store.getState());

        // Костыль, но зато быстрый
        // Мы пропускаем обновление версии стейта, для некоторых его веток (для логов например)
        if (!IGNORE_VERSION_PATH.includes(path[0] as string)) {
            writableState._version += 1;
        }

        writableState = pathSet(path, value, writableState);

        store.setState(writableState);
    };

    Object.defineProperty(fn, 'name', { writable: true });
    // @ts-ignore
    // noinspection JSConstantReassignment
    fn.name = `set${path.map(toString).map(capitalize).join('')}`;

    return fn;
};

export const setValue = function keyFactory<P extends O.Paths<State>>(path: P) {
    return function valueFactory<Value extends O.Path<State, P>>(value: Value) {
        return createService<State, [Value]>(set(path))(value);
    };
};

export const addLogRecord = createService<State, [LogRecord]>(async function addLogRecord(
    { getState, setState, dispatch },
    record,
) {
    const lastRecord = getState().log.lastRecord;
    const msg = record.message;

    record.timestamp ??= new Date();
    record.timestampDiff = lastRecord
        ? ms(lastRecord ? record.timestamp.getTime() - lastRecord.timestamp!.getTime() : 0)
        : '';

    record.message = typeof msg === 'object' ? JSON.stringify(msg, null, 4) : msg;

    dispatch(setValue(['log', 'lastRecord'])(record));
    dispatch(setValue(['log', 'records'])([...getState().log.records, record]));
});

export const resetLogRecords = createService<State>(async function addLogRecord({ dispatch }) {
    dispatch(setValue(['log', 'lastRecord'])(captionLogRecord));
    dispatch(setValue(['log', 'records'])([captionLogRecord]));
});
