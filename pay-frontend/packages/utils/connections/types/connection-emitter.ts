import { IDestroyable } from './destroyable';
import { IOptionable } from './optionable';

export interface IConnectionEmitter<T> extends IDestroyable, IOptionable {
    send(payload: T): void;
    readonly isConnected: boolean;
}
