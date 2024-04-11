export type UnsubscribeCallback = () => void;
export type EventListener<T> = (data: T) => void;
export type SimpleEmitterHandler<T extends Array<any>> = (...args: T) => void;
