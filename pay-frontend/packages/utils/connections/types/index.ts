export * from './connection-agent';
export * from './connection-emitter';
export * from './connection-listener';

export type WindowParams = {
    target?: string;
    features?: string;
};

export type QueryEmitterParams = {
    noEmitSourceUrl?: boolean;
};

export type MessageEmitterParams = {
    target?: Window;
};

export type NativeTarget = Pick<Window, 'postMessage'>;

export type NativeEmitterParams = {
    target?: NativeTarget;
};
