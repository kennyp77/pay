import { SimpleEmitterHandler, UnsubscribeCallback } from './types';

export class SimpleEmitter<T extends Array<any>> {
    private listeners: SimpleEmitterHandler<T>[] = [];

    emit(...args: T): void {
        this.listeners.forEach((listener) => {
            listener(...args);
        });
    }

    on(listener: SimpleEmitterHandler<T>): UnsubscribeCallback {
        this.listeners.push(listener);

        return (): void => {
            this.off(listener);
        };
    }

    off(listener: SimpleEmitterHandler<T>): void {
        this.listeners = this.listeners.filter((comparedListener) => {
            return comparedListener !== listener;
        });
    }

    destroy(): void {
        this.listeners = [];
    }
}
