import { EventListener, UnsubscribeCallback } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventMap = Record<string, any>;
export type EventKey<T extends EventMap> = string & keyof T;
export type EventListenersMap<T extends EventMap> = {
    [K in EventKey<T>]: EventListener<T[K]>[];
};

export class EventEmitter<T extends EventMap> {
    protected listeners = {} as EventListenersMap<T>;

    on<K extends EventKey<T>>(eventName: K, fn: EventListener<T[K]>): UnsubscribeCallback {
        this.listeners[eventName] = this.listeners[eventName] || [];
        this.listeners[eventName].push(fn);

        return (): void => this.off(eventName, fn);
    }

    once<K extends EventKey<T>>(eventName: K, fn: EventListener<T[K]>): UnsubscribeCallback {
        const onceFn = (params: T[K]): void => {
            this.off(eventName, onceFn);
            fn.call(this, params);
        };

        this.listeners[eventName] = this.listeners[eventName] || [];
        this.listeners[eventName].push(onceFn);

        return (): void => this.off(eventName, onceFn);
    }

    off<K extends EventKey<T>>(eventName: K, fn?: EventListener<T[K]>): void {
        if (fn) {
            this.listeners[eventName] = (this.listeners[eventName] || []).filter(
                (_fn) => fn !== _fn,
            );
        } else {
            delete this.listeners[eventName];
        }
    }

    emit<K extends EventKey<T>>(eventName: K, params: T[K]): void {
        (this.listeners[eventName] || []).forEach((listener) => {
            listener.call(this, params);
        });
    }

    clear(): void {
        this.listeners = {} as EventListenersMap<T>;
    }

    destroy(): void {
        this.clear();
    }
}
