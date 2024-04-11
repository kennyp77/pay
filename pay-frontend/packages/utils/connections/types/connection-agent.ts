import { IConnectionEmitter } from './connection-emitter';

export interface IConnectionAgent<T> extends IConnectionEmitter<T> {
    focus(): void;
    close(): void;
}
