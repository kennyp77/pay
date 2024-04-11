import { useCallback } from 'react';

import { useDispatch } from 'react-redux';

import { addLogRecord, resetLogRecords } from 'store/services';
import { State } from 'store/state';
import { LogRecord } from 'store/types';

import { useValue } from './use-store';

export function useLogEvent() {
    const dispatch = useDispatch();

    return useCallback((event: LogRecord) => dispatch(addLogRecord(event)), [dispatch]);
}

export function useResetLogRecords() {
    const dispatch = useDispatch();

    return useCallback(() => dispatch(resetLogRecords()), [dispatch]);
}

export function useLogRecords(): State['log']['records'] {
    return useValue(['log', 'records']);
}
