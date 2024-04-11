import { SERVICE_TRIGGER } from './constants';
import { ServiceCallback, ServiceFn } from './typings';

export function createService<StateSchema, Input extends unknown[] = []>(
    cb: ServiceCallback<StateSchema, Input>,
): ServiceFn<StateSchema, Input> {
    return (...data) => {
        if (__DEV__ && !cb.name) {
            console.warn('Please use named function expression as a callback!');
        }

        const type = __DEV__ ? `${SERVICE_TRIGGER}/${cb.name || 'anonymous'}` : SERVICE_TRIGGER;

        return {
            type: type,
            payloadFn: (control) => cb(control, ...data),
        };
    };
}
