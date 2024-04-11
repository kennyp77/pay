import { contain } from '../array';

import {
    AsyncData,
    AsyncDataCancelled,
    AsyncDataError,
    AsyncDataExceeded,
    AsyncDataInitial,
    AsyncDataPending,
    AsyncDataSuccess,
    AsyncStatus,
} from './types';

const def = {} as AsyncDataInitial;

const initial = <D>(data: Omit<AsyncData<D>, 'status'> = def): AsyncDataInitial<D> => ({
    ...data,
    status: AsyncStatus.Initial,
});

const pending = <D>(data: Omit<AsyncData<D>, 'status'> = def): AsyncDataPending<D> => ({
    ...data,
    status: AsyncStatus.Pending,
});

const error = <E, D>(
    reason: E,
    data: Omit<AsyncData<D, E>, 'status' | 'reason'> = def,
): AsyncDataError<E, D> => ({
    ...data,
    status: AsyncStatus.Error,
    reason,
});

const success = <D>(
    result: D,
    data: Omit<AsyncData<D>, 'status' | 'result'> = def,
): AsyncDataSuccess<D> => ({
    ...data,
    status: AsyncStatus.Success,
    result,
});

const exceeded = <D>(data: Omit<AsyncData<D>, 'status'> = def): AsyncDataExceeded<D> => ({
    ...data,
    status: AsyncStatus.Exceeded,
});

const cancelled = <D>(data: Omit<AsyncData<D>, 'status'> = def): AsyncDataCancelled<D> => ({
    ...data,
    status: AsyncStatus.Cancelled,
});

export const asyncData = {
    initial,
    pending,
    error,
    success,
    exceeded,
    cancelled,
    isNotComplete: contain([AsyncStatus.Initial, AsyncStatus.Pending]),
    isComplete: contain([
        AsyncStatus.Error,
        AsyncStatus.Success,
        AsyncStatus.Exceeded,
        AsyncStatus.Cancelled,
    ]),
    isInitial: contain([AsyncStatus.Initial]),
    isPending: contain([AsyncStatus.Pending]),
    isError: contain([AsyncStatus.Error]),
    isSuccess: contain([AsyncStatus.Success]),
    isExceeded: contain([AsyncStatus.Exceeded]),
    isCancelled: contain([AsyncStatus.Cancelled]),
};

export * from './types';
