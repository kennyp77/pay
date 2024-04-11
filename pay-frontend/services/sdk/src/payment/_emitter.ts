import { EventEmitter, EventKey, EventMap } from '@trust/utils/event-emitter';
import { EventListener, UnsubscribeCallback } from '@trust/utils/event-emitter/types';

import { isPromise } from '../lib/is';

export type PromiseEventListener<T, K> = (data?: T) => Promise<K>;

export type { EventMap };
export type Resolver<T> = (data: T) => void;
export type ResolverMap = { [x: string]: any };
export type EventResolversMap<T extends ResolverMap> = {
    [K in EventKey<T>]: Resolver<T[K]>;
};

export class PaymentEmitter<
    T extends EventMap,
    P extends ResolverMap = {},
> extends EventEmitter<T> {
    protected resolvers = {} as EventResolversMap<P>;

    private resolve<K extends EventKey<P>>(eventName: K, listenerResult: any): void {
        const resolver = this.resolvers[eventName];

        if (resolver && isPromise(listenerResult)) {
            listenerResult.then(resolver);
        }
    }

    override on<K extends EventKey<T>>(
        eventName: K,
        fn: EventListener<T[K]> | PromiseEventListener<T[K], P[K]>,
    ): UnsubscribeCallback {
        return super.on(eventName, fn);
    }

    override emit<K extends EventKey<T>>(eventName: K, params: T[K]): void {
        (this.listeners[eventName] || []).forEach((listener) => {
            const listenerResult = listener.call(this, params);
            this.resolve(eventName, listenerResult);
        });
    }

    protected hasListener = (eventName: EventMap[0]): boolean =>
        this.listeners[eventName] && this.listeners[eventName].length > 0;
}
