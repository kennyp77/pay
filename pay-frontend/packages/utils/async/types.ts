export enum AsyncStatus {
    Initial = 'initial',
    Pending = 'pending',
    Success = 'success',
    Error = 'error',
    Exceeded = 'exceeded',
    Cancelled = 'cancelled',
}

export interface AsyncDataInitial<D = any> {
    status: AsyncStatus.Initial;
    result?: D;
}

export interface AsyncDataPending<D = any> {
    status: AsyncStatus.Pending;
    result?: D;
}

export interface AsyncDataSuccess<D = any> {
    status: AsyncStatus.Success;
    result: D;
}

export interface AsyncDataError<E = any, D = any> {
    status: AsyncStatus.Error;
    reason?: E;
    result?: D;
}

export interface AsyncDataExceeded<D = any> {
    status: AsyncStatus.Exceeded;
    result?: D;
}

export interface AsyncDataCancelled<D = any> {
    status: AsyncStatus.Cancelled;
    result?: D;
}

export type AsyncData<D = any, E = any> =
    | AsyncDataInitial<D>
    | AsyncDataPending<D>
    | AsyncDataSuccess<D>
    | AsyncDataError<E, D>
    | AsyncDataExceeded<D>
    | AsyncDataCancelled<D>;
