import {
    AsyncData,
    AsyncDataCancelled,
    AsyncDataError,
    AsyncDataExceeded,
    AsyncDataInitial,
    AsyncDataPending,
    AsyncDataSuccess,
} from '@trust/utils/async';

declare global {
    namespace Async {
        type DataInitial<D = any> = AsyncDataInitial<D>;

        type DataPending<D = any> = AsyncDataPending<D>;

        type DataSuccess<D = any> = AsyncDataSuccess<D>;

        type DataError<E = any, D = any> = AsyncDataError<E, D>;

        type DataExceeded<D = any> = AsyncDataExceeded<D>;

        type DataCancelled<D = any> = AsyncDataCancelled<D>;

        type Data<D = any, E = any> = AsyncData<D, E>;
    }
}
