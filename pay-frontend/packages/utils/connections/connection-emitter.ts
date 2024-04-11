import { ConnectionOptions } from './connection-options';
import { IConnectionEmitter } from './types';

export abstract class ConnectionEmitter<T> implements IConnectionEmitter<T> {
    constructor(readonly options: ConnectionOptions) {}

    abstract send(payload: T): void;
    abstract destroy(): void;
    abstract get isConnected(): boolean;
}
