/**
 * Хелперы
 */

export type Listener<T> = (event: T) => void;
export type UnsubscribeCallback = () => void;

export interface TypedObject<T> {
    type: T;
}
