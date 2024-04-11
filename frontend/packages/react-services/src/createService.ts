/* eslint-disable @typescript-eslint/no-explicit-any */
import { ServiceAction, ServiceCallback, ServiceCreator } from './types';

export function createService<StateSchema, Input extends any[] = [], Output = void>(
    callback: ServiceCallback<StateSchema, Input, Output>,
): ServiceCreator<StateSchema, Input, Output> {
    return (...data: Input): ServiceAction<StateSchema, Output> => {
        const fn: ServiceAction<StateSchema, Output> = (options) => {
            if (process.env.NODE_ENV !== 'production') {
                const originalSetState = options.setState;

                if (!callback.name) {
                    throw new Error('Please use named function expression as a callback!');
                }

                options.setState = function setState(draft): void {
                    originalSetState(draft, callback.name);
                };

                options.logService(callback.name, data);
            }

            return callback(options, ...data);
        };

        fn.__service = true;

        return fn;
    };
}
