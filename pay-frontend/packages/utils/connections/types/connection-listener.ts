import { ConnectionMessage } from '../connection-message';

import { IDestroyable } from './destroyable';
import { IOptionable } from './optionable';

export type ConnectionMessageTuple<T> = [T, ConnectionMessage<T>];

export interface IConnectionListener extends IDestroyable, IOptionable {}
